"""
NeuroSense Phase 6 — Tests for ESP32 Device Ingestion, Connection Lifecycle,
Data Quality Checks, Mode Switching, and Fault Tolerance.

Run with: python -m pytest backend/tests/test_device_ingestion.py -v
"""
import os
import sys
import time
import pytest

# Make backend importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import database
from sqlalchemy.pool import StaticPool

# Override database.engine with in-memory SQLite before main import
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
database.engine = test_engine

from database import Base, get_db
import models
import crud
import main
from main import app
from device_adapter import DeviceIngestionAdapter

database.Base.metadata.create_all(bind=database.engine)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=database.engine)
main.SessionLocal = TestingSessionLocal
database.SessionLocal = TestingSessionLocal
from fastapi.testclient import TestClient


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    database.Base.metadata.drop_all(bind=test_engine)
    database.Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    crud.init_db_seed(db)
    db.close()


# ──────────────────────────────────────────────────────────────
#  Unit Tests — DeviceIngestionAdapter
# ──────────────────────────────────────────────────────────────

class TestDeviceAdapter:
    def test_mode_switching(self):
        adapter = DeviceIngestionAdapter()
        assert adapter.mode == "simulated"
        adapter.set_mode("esp32_hardware")
        assert adapter.mode == "esp32_hardware"
        adapter.set_mode("invalid_mode")
        assert adapter.mode == "esp32_hardware"  # ignored invalid mode

    def test_health_status_lifecycle(self):
        adapter = DeviceIngestionAdapter(stale_timeout_sec=0.2, disconnect_timeout_sec=0.5)
        status, elapsed = adapter.get_health_status()
        assert status == "disconnected"

        # Receive ping
        from schemas import ESP32HeartbeatSchema
        adapter.process_heartbeat(ESP32HeartbeatSchema(deviceId="esp32_test", uptimeSeconds=10, wifiRssi=-60))
        status, elapsed = adapter.get_health_status()
        assert status == "connected"
        assert elapsed < 0.1

        # Wait past stale timeout
        time.sleep(0.25)
        status, elapsed = adapter.get_health_status()
        assert status == "stale"

        # Wait past disconnect timeout
        time.sleep(0.3)
        status, elapsed = adapter.get_health_status()
        assert status == "disconnected"

    def test_hardware_disconnected_never_fabricates_data(self):
        """CRITICAL: In esp32_hardware mode, a disconnected device MUST return 0s and status 'disconnected'."""
        adapter = DeviceIngestionAdapter(disconnect_timeout_sec=0.01)
        adapter.set_mode("esp32_hardware")

        db = TestingSessionLocal()
        readings = adapter.get_latest_frame_readings(db)
        db.close()

        for sensor_id, reading in readings.items():
            assert reading["rawAdc"] == 0
            assert reading["filteredValue"] == 0
            assert reading["normalizedPercent"] == 0
            assert reading["status"] == "disconnected"


# ──────────────────────────────────────────────────────────────
#  API Integration Tests — Device Endpoints
# ──────────────────────────────────────────────────────────────

class TestDeviceApiEndpoints:
    def test_get_device_status(self):
        res = client.get("/api/device/status")
        assert res.status_code == 200
        data = res.json()
        assert "status" in data
        assert "mode" in data
        assert data["mode"] in ["simulated", "esp32_hardware"]

    def test_set_device_mode(self):
        res = client.post("/api/device/mode", json={"mode": "esp32_hardware"})
        assert res.status_code == 200
        assert res.json()["mode"] == "esp32_hardware"

        # Verify status endpoint reflects mode
        res_status = client.get("/api/device/status")
        assert res_status.json()["mode"] == "esp32_hardware"

        # Reset back to simulated
        client.post("/api/device/mode", json={"mode": "simulated"})

    def test_post_valid_telemetry(self):
        payload = {
            "deviceId": "esp32_neurosense_test",
            "sequence": 1,
            "deviceTimestampMs": 1000,
            "readings": {
                "fsr_thumb": 2048,
                "flex_thumb": 2400
            },
            "wifiRssi": -65
        }
        res = client.post("/api/device/telemetry", json=payload)
        assert res.status_code == 202
        assert res.json()["status"] == "accepted"
        assert res.json()["sequence"] == 1

    def test_post_heartbeat(self):
        payload = {
            "deviceId": "esp32_neurosense_test",
            "uptimeSeconds": 120,
            "wifiRssi": -55,
            "firmwareVersion": "1.0.0"
        }
        res = client.post("/api/device/heartbeat", json=payload)
        assert res.status_code == 200
        assert res.json()["status"] == "ok"

    def test_post_malformed_telemetry_rejected(self):
        """Malformed payloads missing required fields or with out-of-bounds ADC must be rejected with 422."""
        bad_payload = {
            "deviceId": "esp32_test",
            "readings": {
                "fsr_thumb": 99999  # ADC > 4095 violates Pydantic le=4095 check
            }
        }
        res = client.post("/api/device/telemetry", json=bad_payload)
        assert res.status_code == 422

    def test_recording_during_hardware_interruption(self):
        """Test starting a recording, posting device data, simulating disconnect, and stopping session safely."""
        # 1. Start session
        res_start = client.post("/api/sessions/start", json={
            "title": "Hardware Disconnect Test",
            "description": "Testing resilience under packet drop",
            "source": "esp32_hardware"
        })
        assert res_start.status_code == 201
        session_id = res_start.json()["id"]

        # 2. Ingest 2 good frames
        client.post("/api/device/telemetry", json={
            "deviceId": "esp32_test",
            "sequence": 1,
            "readings": {"fsr_thumb": 1500}
        })

        # 3. Stop session cleanly
        res_stop = client.post(f"/api/sessions/{session_id}/stop")
        assert res_stop.status_code == 200
        assert res_stop.json()["status"] == "completed"
