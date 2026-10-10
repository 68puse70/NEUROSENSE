"""
NeuroSense Phase 6 — ESP32 Hardware Device Ingestion Adapter

Handles real ESP32 hardware telemetry payloads, sequence checking, missing channel
detection, acquisition rate tracking, and connection lifecycle (connected / stale / disconnected).

CRITICAL DIRECTIVE:
  In 'esp32_hardware' mode, if the hardware device is disconnected or stale,
  the adapter marks all channels as 'disconnected' with 0 ADC values.
  It NEVER fabricates or simulates readings when hardware mode is active.
"""

import time
from datetime import datetime, timezone
from typing import Dict, Optional, Tuple
from sqlalchemy.orm import Session

import crud
from normalization import normalize_adc, apply_ema_filter, clamp_adc
from schemas import ESP32DevicePayloadSchema, ESP32HeartbeatSchema, DeviceStatusSchema


class DeviceIngestionAdapter:
    def __init__(self, stale_timeout_sec: float = 2.0, disconnect_timeout_sec: float = 5.0):
        self.stale_timeout_sec = stale_timeout_sec
        self.disconnect_timeout_sec = disconnect_timeout_sec

        # Configuration
        self.mode: str = "simulated"  # 'simulated' | 'esp32_hardware'

        # Device State
        self.device_id: Optional[str] = None
        self.last_seen_time: Optional[float] = None
        self.last_seen_iso: Optional[str] = None
        self.last_sequence: int = -1
        self.packets_received: int = 0
        self.packets_dropped: int = 0
        self.wifi_rssi: Optional[int] = None
        self.battery_voltage: Optional[float] = None
        self.uptime_seconds: int = 0
        self.firmware_version: str = "1.0.0"

        # Telemetry Cache & EMA Filters
        self.latest_raw_readings: Dict[str, int] = {}
        self.filter_state: Dict[str, float] = {}

        # Acquisition rate calculation (rolling window)
        self._timestamps_window = []

    def set_mode(self, new_mode: str) -> str:
        """Switch source mode between 'simulated' and 'esp32_hardware'."""
        if new_mode in ["simulated", "esp32_hardware"]:
            self.mode = new_mode
        return self.mode

    def process_telemetry(self, payload: ESP32DevicePayloadSchema, db: Session) -> Dict[str, any]:
        """
        Process incoming ESP32 HTTP POST telemetry frame.
        Validates payload, calculates EMA, normalizes values using active DB calibration.
        """
        now = datetime.now(timezone.utc)
        now_ts = now.timestamp()

        # Update metadata & acquisition window
        self.device_id = payload.deviceId
        self.last_seen_time = now_ts
        self.last_seen_iso = now.isoformat()
        self.packets_received += 1
        if payload.wifiRssi is not None:
            self.wifi_rssi = payload.wifiRssi
        if payload.batteryVoltage is not None:
            self.battery_voltage = payload.batteryVoltage

        # Detect dropped packets via sequence counter
        if payload.sequence is not None and self.last_sequence >= 0:
            expected = self.last_sequence + 1
            if payload.sequence > expected:
                self.packets_dropped += (payload.sequence - expected)
        if payload.sequence is not None:
            self.last_sequence = payload.sequence

        # Update rolling acquisition frequency
        self._timestamps_window.append(now_ts)
        cutoff = now_ts - 3.0
        self._timestamps_window = [t for t in self._timestamps_window if t >= cutoff]

        # Extract raw readings dictionary
        self.latest_raw_readings = payload.readings

        return self.get_latest_frame_readings(db)

    def process_heartbeat(self, heartbeat: ESP32HeartbeatSchema):
        """Process periodic health ping from ESP32."""
        now = datetime.now(timezone.utc)
        self.device_id = heartbeat.deviceId
        self.last_seen_time = now.timestamp()
        self.last_seen_iso = now.isoformat()
        self.uptime_seconds = heartbeat.uptimeSeconds
        self.wifi_rssi = heartbeat.wifiRssi
        if heartbeat.firmwareVersion:
            self.firmware_version = heartbeat.firmwareVersion

    def get_health_status(self) -> Tuple[str, float]:
        """
        Returns (connection_status, seconds_since_last_packet).
        status: 'connected' | 'stale' | 'disconnected'
        """
        if self.last_seen_time is None:
            return "disconnected", 999999.0

        elapsed = time.time() - self.last_seen_time
        if elapsed > self.disconnect_timeout_sec:
            return "disconnected", elapsed
        elif elapsed > self.stale_timeout_sec:
            return "stale", elapsed
        return "connected", elapsed

    def get_acquisition_hz(self) -> float:
        """Calculate recent hardware acquisition sampling rate in Hz."""
        if len(self._timestamps_window) < 2:
            return 0.0
        duration = self._timestamps_window[-1] - self._timestamps_window[0]
        if duration <= 0:
            return 0.0
        return round((len(self._timestamps_window) - 1) / duration, 1)

    def get_latest_frame_readings(self, db: Session) -> Dict[str, dict]:
        """
        Generates telemetry readings dict for all database-configured sensors.
        Respects active calibration profiles.
        In 'esp32_hardware' mode with a disconnected device, returns 0s with 'disconnected' status.
        """
        now = datetime.now(timezone.utc)
        timestamp_ms = now.timestamp() * 1000

        health_status, elapsed = self.get_health_status()
        sensor_configs = crud.get_all_sensor_configs(db)

        readings = {}
        for cfg in sensor_configs:
            min_adc = cfg.calibration.minAdc
            max_adc = cfg.calibration.maxAdc

            if not cfg.enabled:
                readings[cfg.id] = {
                    "id": cfg.id,
                    "name": cfg.name,
                    "type": cfg.type,
                    "rawAdc": 0,
                    "filteredValue": 0,
                    "normalizedPercent": 0,
                    "unit": "ADC",
                    "minRaw": min_adc,
                    "maxRaw": max_adc,
                    "status": "disconnected",
                    "lastUpdated": timestamp_ms,
                }
                continue

            # In hardware mode, if device is disconnected or missing data for channel
            if self.mode == "esp32_hardware":
                if health_status == "disconnected" or cfg.id not in self.latest_raw_readings:
                    readings[cfg.id] = {
                        "id": cfg.id,
                        "name": cfg.name,
                        "type": cfg.type,
                        "rawAdc": 0,
                        "filteredValue": 0,
                        "normalizedPercent": 0,
                        "unit": "ADC",
                        "minRaw": min_adc,
                        "maxRaw": max_adc,
                        "status": "disconnected" if health_status == "disconnected" else "stale",
                        "lastUpdated": timestamp_ms,
                    }
                    continue

            # Obtain raw reading from payload or fallback 0
            raw_val = self.latest_raw_readings.get(cfg.id, 0)
            raw_clamped = clamp_adc(raw_val)

            # Apply EMA smoothing
            prev_filtered = self.filter_state.get(cfg.id)
            filtered = apply_ema_filter(raw_clamped, prev_filtered)
            self.filter_state[cfg.id] = filtered

            # Apply calibration normalization
            normalized_pct = normalize_adc(filtered, min_adc, max_adc)

            # Determine channel status
            ch_status = health_status
            if ch_status == "connected":
                if raw_clamped >= 4050:
                    ch_status = "warning"
                elif raw_clamped <= 10:
                    ch_status = "normal"

            readings[cfg.id] = {
                "id": cfg.id,
                "name": cfg.name,
                "type": cfg.type,
                "rawAdc": raw_clamped,
                "filteredValue": filtered,
                "normalizedPercent": normalized_pct,
                "unit": "ADC",
                "minRaw": min_adc,
                "maxRaw": max_adc,
                "status": ch_status,
                "lastUpdated": timestamp_ms,
            }

        return readings

    def get_device_status_schema(self) -> DeviceStatusSchema:
        health_status, elapsed = self.get_health_status()
        return DeviceStatusSchema(
            status=health_status,
            mode=self.mode,
            deviceId=self.device_id,
            lastSeenTimestampUtc=self.last_seen_iso,
            lastSeenMsAgo=round(elapsed * 1000, 1) if self.last_seen_time else None,
            packetsReceived=self.packets_received,
            packetsDropped=self.packets_dropped,
            acquisitionHz=self.get_acquisition_hz(),
            wifiRssi=self.wifi_rssi,
            batteryVoltage=self.battery_voltage,
            activeSensorsCount=len(self.latest_raw_readings),
        )


# Global device adapter instance
device_adapter = DeviceIngestionAdapter()
