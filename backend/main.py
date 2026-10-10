import asyncio
import math
import random
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List
from fastapi import FastAPI, Depends, HTTPException, Response, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db, SessionLocal
import crud
import schemas
from normalization import normalize_adc, apply_ema_filter, clamp_adc
from websocket_manager import manager

Base.metadata.create_all(bind=engine)

phase = 0.0
telemetry_task: asyncio.Task = None
# Per-sensor EMA filter state for the backend telemetry loop
_filter_state: dict = {}


# Custom CORS Middleware that safely passes WebSocket upgrade handshakes directly to WebSocket endpoints
class CustomCORSMiddleware(CORSMiddleware):
    async def __call__(self, scope, receive, send):
        if scope["type"] == "websocket":
            await self.app(scope, receive, send)
            return
        await super().__call__(scope, receive, send)


from device_adapter import device_adapter


async def telemetry_broadcast_loop():
    global phase, _filter_state
    while True:
        try:
            await asyncio.sleep(0.05) # 20 Hz WebSocket Broadcast
            if len(manager.active_connections) == 0:
                continue

            phase += 0.05
            now = datetime.now(timezone.utc)
            timestamp_ms = now.timestamp() * 1000
            formatted_time = now.strftime("%H:%M:%S.") + f"{int(now.microsecond / 1000):03d}"

            with SessionLocal() as db:
                if device_adapter.mode == "esp32_hardware":
                    readings = device_adapter.get_latest_frame_readings(db)
                else:
                    pinch_envelope = max(0.0, math.sin(phase % (math.pi * 6)))
                    grip_envelope = max(0.0, math.sin((phase % (math.pi * 6)) / 2 - math.pi / 4))
                    flex_wave = math.sin(phase * 0.8) * 0.5 + 0.5

                    readings = {}
                    sensor_configs = crud.get_all_sensor_configs(db)

                    for cfg in sensor_configs:
                        if not cfg.enabled:
                            readings[cfg.id] = {
                                "id": cfg.id,
                                "name": cfg.name,
                                "type": cfg.type,
                                "rawAdc": 0,
                                "filteredValue": 0,
                                "normalizedPercent": 0,
                                "unit": "ADC",
                                "minRaw": cfg.calibration.minAdc,
                                "maxRaw": cfg.calibration.maxAdc,
                                "status": "disconnected",
                                "lastUpdated": timestamp_ms,
                            }
                            continue

                        min_adc = cfg.calibration.minAdc
                        max_adc = cfg.calibration.maxAdc
                        rng = max(1, max_adc - min_adc)

                        target_norm = 0.0
                        if cfg.location in ["thumb", "index"]:
                            target_norm = pinch_envelope * 0.85 + grip_envelope * 0.3
                        elif cfg.location == "palm":
                            target_norm = grip_envelope * 0.5
                        else:
                            target_norm = flex_wave * 0.7

                        target_norm = max(0.0, min(1.0, target_norm + random.uniform(-0.02, 0.02)))
                        raw_adc = clamp_adc(int(min_adc + target_norm * rng + random.gauss(0, 15)))

                        # Use normalization module's EMA filter
                        prev_filtered = _filter_state.get(cfg.id)
                        filtered = apply_ema_filter(raw_adc, prev_filtered)
                        _filter_state[cfg.id] = filtered

                        # Use normalization module for percentage
                        normalized_pct = normalize_adc(filtered, min_adc, max_adc)

                        status_text = "normal"
                        if raw_adc >= 4050:
                            status_text = "warning"

                        readings[cfg.id] = {
                            "id": cfg.id,
                            "name": cfg.name,
                            "type": cfg.type,
                            "rawAdc": raw_adc,
                            "filteredValue": filtered,
                            "normalizedPercent": normalized_pct,
                            "unit": "ADC",
                            "minRaw": min_adc,
                            "maxRaw": max_adc,
                            "status": status_text,
                            "lastUpdated": timestamp_ms,
                        }

            accel_x = round(math.sin(phase * 1.2) * 0.5 + random.uniform(-0.05, 0.05), 2)
            accel_y = round(math.cos(phase * 0.8) * 0.3 + random.uniform(-0.05, 0.05), 2)
            accel_z = round(9.81 + math.sin(phase * 0.5) * 0.4 + random.uniform(-0.05, 0.05), 2)
            gyro_x = round(math.sin(phase * 3.0) * 15.0, 2)
            gyro_y = round(math.cos(phase * 2.5) * 12.0, 2)
            gyro_z = round(math.sin(phase * 1.5) * 8.0, 2)
            pitch = round(math.sin(phase * 0.4) * 25.0, 1)
            roll = round(math.cos(phase * 0.4) * 20.0, 1)
            accel_mag = round(math.sqrt(accel_x**2 + accel_y**2 + accel_z**2), 2)
            gyro_mag = round(math.sqrt(gyro_x**2 + gyro_y**2 + gyro_z**2), 2)

            imu_payload = {
                "accelX": accel_x,
                "accelY": accel_y,
                "accelZ": accel_z,
                "gyroX": gyro_x,
                "gyroY": gyro_y,
                "gyroZ": gyro_z,
                "pitch": pitch,
                "roll": roll,
                "accelMag": accel_mag,
                "gyroMag": gyro_mag,
            }

            payload = {
                "protocolVersion": "1.0",
                "type": "telemetry_frame",
                "timestamp": timestamp_ms,
                "timestampUtc": now.isoformat(),
                "formattedTime": formatted_time,
                "readings": readings,
                "imu": imu_payload,
            }

            await manager.broadcast_json(payload)
        except Exception:
            await asyncio.sleep(0.1)


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = next(get_db())
    crud.init_db_seed(db)
    global telemetry_task
    telemetry_task = asyncio.create_task(telemetry_broadcast_loop())
    yield
    if telemetry_task:
        telemetry_task.cancel()


app = FastAPI(
    title="NeuroSense Precision Lab API",
    description="Backend API & WebSocket Telemetry Streaming Server",
    version="1.1.0",
    lifespan=lifespan,
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CustomCORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=schemas.HealthResponseSchema)
def get_health(db: Session = Depends(get_db)):
    return {
        "status": "online",
        "database": "sqlite_connected",
        "timestampUtc": datetime.now(timezone.utc).isoformat(),
    }


# Sensor Config Endpoints
@app.get("/api/sensors", response_model=List[schemas.SensorConfigSchema])
def get_sensors(db: Session = Depends(get_db)):
    return crud.get_all_sensor_configs(db)


@app.get("/api/sensors/{sensor_id}", response_model=schemas.SensorConfigSchema)
def get_sensor(sensor_id: str, db: Session = Depends(get_db)):
    cfg = crud.get_sensor_config(db, sensor_id)
    if not cfg:
        raise HTTPException(status_code=404, detail=f"Sensor '{sensor_id}' not found.")
    return cfg


@app.put("/api/sensors/{sensor_id}", response_model=schemas.SensorConfigSchema)
def update_sensor(sensor_id: str, updates: schemas.SensorConfigUpdateSchema, db: Session = Depends(get_db)):
    updated = crud.update_sensor_config(db, sensor_id, updates.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail=f"Sensor config '{sensor_id}' not found.")
    return updated


@app.post("/api/sensors/{sensor_id}/tare", response_model=schemas.SensorConfigSchema)
def tare_sensor(sensor_id: str, payload: schemas.TareRequestSchema, db: Session = Depends(get_db)):
    updated = crud.apply_tare_offset(db, sensor_id, payload.rawAdc)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Sensor '{sensor_id}' not found for tare application.")
    return updated


# Phase 5: Guided calibration endpoint
@app.post("/api/sensors/{sensor_id}/calibrate", response_model=schemas.SensorConfigSchema)
def calibrate_sensor(sensor_id: str, payload: schemas.GuidedCalibrationSchema, db: Session = Depends(get_db)):
    try:
        result = crud.apply_guided_calibration(
            db, sensor_id,
            min_adc=payload.minAdc,
            max_adc=payload.maxAdc,
            zero_offset=payload.zeroOffset,
            source=payload.source,
            notes=payload.notes,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    if not result:
        raise HTTPException(status_code=404, detail=f"Sensor '{sensor_id}' not found.")
    return result


# Phase 5: Factory reset endpoint (single sensor)
@app.post("/api/sensors/{sensor_id}/reset", response_model=schemas.SensorConfigSchema)
def reset_sensor(sensor_id: str, db: Session = Depends(get_db)):
    result = crud.reset_sensor_to_factory(db, sensor_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Sensor '{sensor_id}' not found.")
    return result


# Phase 5: Factory reset ALL sensors
@app.post("/api/sensors/reset-all", response_model=List[schemas.SensorConfigSchema])
def reset_all_sensors(db: Session = Depends(get_db)):
    configs = crud.get_all_sensor_configs(db)
    results = []
    for cfg in configs:
        result = crud.reset_sensor_to_factory(db, cfg.id)
        if result:
            results.append(result)
    return results


# Phase 5: Calibration history endpoint
@app.get("/api/sensors/{sensor_id}/calibration-history", response_model=List[schemas.CalibrationHistoryEntrySchema])
def get_calibration_history(sensor_id: str, db: Session = Depends(get_db)):
    return crud.get_calibration_history(db, sensor_id)


# Phase 5: Validate calibration range preview
@app.post("/api/sensors/{sensor_id}/validate-calibration", response_model=schemas.CalibrationValidationResultSchema)
def validate_calibration(sensor_id: str, payload: schemas.GuidedCalibrationSchema, db: Session = Depends(get_db)):
    from normalization import validate_calibration_range, normalize_adc
    is_valid, error = validate_calibration_range(payload.minAdc, payload.maxAdc)
    sample_pct = 0
    if is_valid:
        # Use midpoint as sample
        mid = (payload.minAdc + payload.maxAdc) // 2
        sample_pct = normalize_adc(mid, payload.minAdc, payload.maxAdc)
    return schemas.CalibrationValidationResultSchema(
        valid=is_valid,
        error=error,
        normalizedSample=sample_pct,
    )


# Session Endpoints
@app.post("/api/sessions/start", response_model=schemas.SessionRecordSchema, status_code=status.HTTP_201_CREATED)
def start_session(payload: schemas.SessionStartSchema, db: Session = Depends(get_db)):
    return crud.create_session(
        db,
        title=payload.title,
        description=payload.description or "",
        source=payload.source or "simulated",
        sample_rate_hz=payload.sampleRateHz or 20,
    )


@app.post("/api/sessions/{session_id}/readings", status_code=status.HTTP_200_OK)
def append_readings(session_id: str, payload: schemas.ReadingsBatchSchema, db: Session = Depends(get_db)):
    crud.add_readings_batch(db, session_id, payload.frames)
    return {"status": "success", "addedFrames": len(payload.frames)}


@app.post("/api/sessions/{session_id}/stop", response_model=schemas.SessionDetailSchema)
def stop_session(session_id: str, db: Session = Depends(get_db)):
    stopped = crud.stop_session(db, session_id)
    if not stopped:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    return stopped


@app.get("/api/sessions", response_model=List[schemas.SessionRecordSchema])
def list_sessions(db: Session = Depends(get_db)):
    return crud.get_all_sessions(db)


@app.get("/api/sessions/{session_id}", response_model=schemas.SessionDetailSchema)
def get_session(session_id: str, db: Session = Depends(get_db)):
    session = crud.get_session_by_id(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    return session


@app.delete("/api/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(session_id: str, db: Session = Depends(get_db)):
    deleted = crud.delete_session(db, session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/api/sessions/{session_id}/export.csv")
def export_session_csv(session_id: str, db: Session = Depends(get_db)):
    csv_content = crud.generate_session_csv(db, session_id)
    if csv_content is None:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")

    filename = f"neurosense_{session_id}_export.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


# ──────────────────────────────────────────────────────────────
#  Phase 6: ESP32 Device Ingestion & Status Endpoints
# ──────────────────────────────────────────────────────────────

@app.post("/api/device/telemetry", status_code=status.HTTP_202_ACCEPTED)
def receive_device_telemetry(payload: schemas.ESP32DevicePayloadSchema, db: Session = Depends(get_db)):
    """
    Ingest raw 12-bit ADC telemetry frame pushed by real ESP32 over HTTP POST.
    Validates range [0, 4095], applies EMA filter & DB calibration, updates device status.
    """
    readings = device_adapter.process_telemetry(payload, db)
    return {"status": "accepted", "sequence": payload.sequence, "activeSensors": len(payload.readings)}


@app.post("/api/device/heartbeat", status_code=status.HTTP_200_OK)
def receive_device_heartbeat(heartbeat: schemas.ESP32HeartbeatSchema):
    """Periodic health ping submitted by ESP32."""
    device_adapter.process_heartbeat(heartbeat)
    return {"status": "ok", "timestampUtc": datetime.now(timezone.utc).isoformat()}


@app.get("/api/device/status", response_model=schemas.DeviceStatusSchema)
def get_device_status():
    """Retrieve real-time ESP32 hardware status, acquisition rate, and health metrics."""
    return device_adapter.get_device_status_schema()


@app.post("/api/device/mode")
def set_device_mode(body: dict):
    """
    Toggle server data source mode between 'simulated' and 'esp32_hardware'.
    body: { "mode": "simulated" | "esp32_hardware" }
    """
    new_mode = body.get("mode", "simulated")
    if new_mode not in ["simulated", "esp32_hardware"]:
        raise HTTPException(status_code=400, detail="Invalid mode. Must be 'simulated' or 'esp32_hardware'.")
    active_mode = device_adapter.set_mode(new_mode)
    return {"status": "updated", "mode": active_mode}


# WebSocket Telemetry Stream Endpoint
@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await websocket.accept()
    manager.active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
