import json
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from models import SensorConfigModel, SessionModel, ReadingModel, CalibrationHistoryModel
from schemas import (
    SensorConfigSchema,
    CalibrationDataSchema,
    SessionRecordSchema,
    SessionDetailSchema,
    TelemetryFrameSchema,
    SingleReadingSchema,
    CalibrationHistoryEntrySchema,
    CalibrationValidationResultSchema,
)
from normalization import validate_calibration_range, normalize_adc

DEFAULT_CONFIGS = [
  # FSR Sensors
  {"id": "fsr_thumb", "name": "FSR Thumb Tip", "type": "fsr", "pin": "A0 (GPIO36)", "enabled": True, "color": "#35D0C1", "location": "thumb", "zero_offset": 120, "min_adc": 120, "max_adc": 3950, "scale_factor": 1.0, "tare_applied": True},
  {"id": "fsr_index", "name": "FSR Index Tip", "type": "fsr", "pin": "A1 (GPIO39)", "enabled": True, "color": "#43C98B", "location": "index", "zero_offset": 110, "min_adc": 110, "max_adc": 3890, "scale_factor": 1.0, "tare_applied": True},
  {"id": "fsr_middle", "name": "FSR Middle Tip", "type": "fsr", "pin": "A2 (GPIO34)", "enabled": True, "color": "#38BDF8", "location": "middle", "zero_offset": 130, "min_adc": 130, "max_adc": 4010, "scale_factor": 1.0, "tare_applied": True},
  {"id": "fsr_ring", "name": "FSR Ring Tip", "type": "fsr", "pin": "A3 (GPIO35)", "enabled": True, "color": "#A855F7", "location": "ring", "zero_offset": 105, "min_adc": 105, "max_adc": 3750, "scale_factor": 1.0, "tare_applied": True},
  {"id": "fsr_pinky", "name": "FSR Pinky Tip", "type": "fsr", "pin": "A4 (GPIO32)", "enabled": True, "color": "#EC4899", "location": "pinky", "zero_offset": 115, "min_adc": 115, "max_adc": 3600, "scale_factor": 1.0, "tare_applied": True},
  {"id": "fsr_palm", "name": "FSR Palm Base", "type": "fsr", "pin": "A5 (GPIO33)", "enabled": True, "color": "#F59E0B", "location": "palm", "zero_offset": 140, "min_adc": 140, "max_adc": 3900, "scale_factor": 1.0, "tare_applied": True},

  # Flex Sensors
  {"id": "flex_thumb", "name": "Flex Thumb Joint", "type": "flex", "pin": "A6 (GPIO25)", "enabled": True, "color": "#F4B860", "location": "flex_thumb", "zero_offset": 1450, "min_adc": 1450, "max_adc": 3400, "scale_factor": 1.0, "tare_applied": True},
  {"id": "flex_index", "name": "Flex Index Joint", "type": "flex", "pin": "A7 (GPIO26)", "enabled": True, "color": "#6366F1", "location": "flex_index", "zero_offset": 1400, "min_adc": 1400, "max_adc": 3500, "scale_factor": 1.0, "tare_applied": True},
  {"id": "flex_middle", "name": "Flex Middle Joint", "type": "flex", "pin": "A8 (GPIO27)", "enabled": True, "color": "#10B981", "location": "flex_middle", "zero_offset": 1420, "min_adc": 1420, "max_adc": 3550, "scale_factor": 1.0, "tare_applied": True},
  {"id": "flex_ring", "name": "Flex Ring Joint", "type": "flex", "pin": "A9 (GPIO14)", "enabled": True, "color": "#8B5CF6", "location": "flex_ring", "zero_offset": 1380, "min_adc": 1380, "max_adc": 3480, "scale_factor": 1.0, "tare_applied": True},
  {"id": "flex_pinky", "name": "Flex Pinky Joint", "type": "flex", "pin": "A10 (GPIO12)", "enabled": True, "color": "#F43F5E", "location": "flex_pinky", "zero_offset": 1350, "min_adc": 1350, "max_adc": 3420, "scale_factor": 1.0, "tare_applied": True},
]


from sqlalchemy import text


def init_db_seed(db: Session):
    # Auto-migration for SQLite columns added in Phase 5/6 if table exists from previous schema
    try:
        db.execute(text("SELECT calibration_version FROM sensor_configs LIMIT 1"))
    except Exception:
        db.rollback()
        try:
            db.execute(text("ALTER TABLE sensor_configs ADD COLUMN calibration_version INTEGER DEFAULT 1"))
            db.commit()
        except Exception:
            db.rollback()
        try:
            db.execute(text("ALTER TABLE sensor_configs ADD COLUMN calibration_source TEXT DEFAULT 'factory'"))
            db.commit()
        except Exception:
            db.rollback()

    existing_count = db.query(SensorConfigModel).count()
    if existing_count == 0:
        now_utc = datetime.now(timezone.utc).isoformat()
        for cfg in DEFAULT_CONFIGS:
            db_config = SensorConfigModel(
                id=cfg["id"],
                name=cfg["name"],
                type=cfg["type"],
                pin=cfg["pin"],
                enabled=cfg["enabled"],
                color=cfg["color"],
                location=cfg["location"],
                zero_offset=cfg["zero_offset"],
                min_adc=cfg["min_adc"],
                max_adc=cfg["max_adc"],
                scale_factor=cfg["scale_factor"],
                tare_applied=cfg["tare_applied"],
                last_calibrated_at=now_utc,
                calibration_version=1,
                calibration_source="factory",
            )
            db.add(db_config)

            # Seed initial calibration history
            history = CalibrationHistoryModel(
                sensor_id=cfg["id"],
                version=1,
                min_adc=cfg["min_adc"],
                max_adc=cfg["max_adc"],
                zero_offset=cfg["zero_offset"],
                scale_factor=cfg["scale_factor"],
                source="factory",
                created_at_utc=now_utc,
                notes="Initial factory defaults",
            )
            db.add(history)
        db.commit()


def _sensor_to_schema(m: SensorConfigModel) -> SensorConfigSchema:
    return SensorConfigSchema(
        id=m.id,
        name=m.name,
        type=m.type,
        pin=m.pin,
        enabled=m.enabled,
        color=m.color,
        location=m.location,
        calibration=CalibrationDataSchema(
            zeroOffset=m.zero_offset,
            minAdc=m.min_adc,
            maxAdc=m.max_adc,
            scaleFactor=m.scale_factor,
            tareApplied=m.tare_applied,
            lastCalibratedAt=m.last_calibrated_at,
            version=m.calibration_version,
            source=m.calibration_source,
        ),
    )


def get_all_sensor_configs(db: Session) -> List[SensorConfigSchema]:
    models = db.query(SensorConfigModel).all()
    return [_sensor_to_schema(m) for m in models]


def get_sensor_config(db: Session, sensor_id: str) -> Optional[SensorConfigSchema]:
    m = db.query(SensorConfigModel).filter(SensorConfigModel.id == sensor_id).first()
    if not m:
        return None
    return _sensor_to_schema(m)


def update_sensor_config(db: Session, sensor_id: str, updates: dict) -> Optional[SensorConfigSchema]:
    model = db.query(SensorConfigModel).filter(SensorConfigModel.id == sensor_id).first()
    if not model:
        return None

    if "name" in updates and updates["name"] is not None:
        model.name = updates["name"]
    if "enabled" in updates and updates["enabled"] is not None:
        model.enabled = updates["enabled"]
    if "minAdc" in updates and updates["minAdc"] is not None:
        model.min_adc = updates["minAdc"]
    if "maxAdc" in updates and updates["maxAdc"] is not None:
        model.max_adc = updates["maxAdc"]
    if "zeroOffset" in updates and updates["zeroOffset"] is not None:
        model.zero_offset = updates["zeroOffset"]

    model.last_calibrated_at = datetime.now(timezone.utc).isoformat()
    db.commit()
    db.refresh(model)

    return _sensor_to_schema(model)


def apply_tare_offset(db: Session, sensor_id: str, raw_adc: int) -> Optional[SensorConfigSchema]:
    """Apply tare (zero baseline) and bump calibration version."""
    model = db.query(SensorConfigModel).filter(SensorConfigModel.id == sensor_id).first()
    if not model:
        return None

    now_utc = datetime.now(timezone.utc).isoformat()
    model.zero_offset = raw_adc
    model.min_adc = raw_adc
    model.tare_applied = True
    model.calibration_version += 1
    model.calibration_source = "tare"
    model.last_calibrated_at = now_utc

    # Record in history
    history = CalibrationHistoryModel(
        sensor_id=sensor_id,
        version=model.calibration_version,
        min_adc=model.min_adc,
        max_adc=model.max_adc,
        zero_offset=model.zero_offset,
        scale_factor=model.scale_factor,
        source="tare",
        created_at_utc=now_utc,
        notes=f"Tare applied at raw ADC = {raw_adc}",
    )
    db.add(history)
    db.commit()
    db.refresh(model)

    return _sensor_to_schema(model)


def apply_guided_calibration(
    db: Session,
    sensor_id: str,
    min_adc: int,
    max_adc: int,
    zero_offset: Optional[int],
    source: str,
    notes: str,
) -> Optional[SensorConfigSchema]:
    """
    Apply a validated guided or manual calibration.

    Validates the range before persisting. Returns None if sensor not found,
    raises ValueError if the range is invalid.
    """
    model = db.query(SensorConfigModel).filter(SensorConfigModel.id == sensor_id).first()
    if not model:
        return None

    # Validate
    is_valid, error = validate_calibration_range(min_adc, max_adc)
    if not is_valid:
        raise ValueError(error)

    now_utc = datetime.now(timezone.utc).isoformat()
    model.min_adc = min_adc
    model.max_adc = max_adc
    model.zero_offset = zero_offset if zero_offset is not None else min_adc
    model.tare_applied = True
    model.calibration_version += 1
    model.calibration_source = source
    model.last_calibrated_at = now_utc

    # Record in history
    history = CalibrationHistoryModel(
        sensor_id=sensor_id,
        version=model.calibration_version,
        min_adc=model.min_adc,
        max_adc=model.max_adc,
        zero_offset=model.zero_offset,
        scale_factor=model.scale_factor,
        source=source,
        created_at_utc=now_utc,
        notes=notes,
    )
    db.add(history)
    db.commit()
    db.refresh(model)

    return _sensor_to_schema(model)


def reset_sensor_to_factory(db: Session, sensor_id: str) -> Optional[SensorConfigSchema]:
    """Reset one sensor back to its factory calibration defaults."""
    model = db.query(SensorConfigModel).filter(SensorConfigModel.id == sensor_id).first()
    if not model:
        return None

    factory = next((c for c in DEFAULT_CONFIGS if c["id"] == sensor_id), None)
    if not factory:
        return None

    now_utc = datetime.now(timezone.utc).isoformat()
    model.min_adc = factory["min_adc"]
    model.max_adc = factory["max_adc"]
    model.zero_offset = factory["zero_offset"]
    model.scale_factor = factory["scale_factor"]
    model.tare_applied = factory["tare_applied"]
    model.calibration_version += 1
    model.calibration_source = "factory"
    model.last_calibrated_at = now_utc

    history = CalibrationHistoryModel(
        sensor_id=sensor_id,
        version=model.calibration_version,
        min_adc=model.min_adc,
        max_adc=model.max_adc,
        zero_offset=model.zero_offset,
        scale_factor=model.scale_factor,
        source="factory",
        created_at_utc=now_utc,
        notes="Reset to factory defaults",
    )
    db.add(history)
    db.commit()
    db.refresh(model)

    return _sensor_to_schema(model)


def get_calibration_history(db: Session, sensor_id: str) -> List[CalibrationHistoryEntrySchema]:
    rows = (
        db.query(CalibrationHistoryModel)
        .filter(CalibrationHistoryModel.sensor_id == sensor_id)
        .order_by(CalibrationHistoryModel.version.desc())
        .all()
    )
    return [
        CalibrationHistoryEntrySchema(
            id=r.id,
            sensorId=r.sensor_id,
            version=r.version,
            minAdc=r.min_adc,
            maxAdc=r.max_adc,
            zeroOffset=r.zero_offset,
            scaleFactor=r.scale_factor,
            source=r.source,
            createdAtUtc=r.created_at_utc,
            notes=r.notes,
        )
        for r in rows
    ]


def get_current_calibration_snapshot(db: Session) -> Dict[str, int]:
    """Return {sensor_id: calibration_version} for all sensors."""
    models = db.query(SensorConfigModel).all()
    return {m.id: m.calibration_version for m in models}


# Session Management
def create_session(db: Session, title: str, description: str, source: str, sample_rate_hz: int) -> SessionRecordSchema:
    session_id = f"sess_{uuid.uuid4().hex[:10]}"
    now_utc = datetime.now(timezone.utc).isoformat()

    # Capture calibration version snapshot
    cal_snapshot = get_current_calibration_snapshot(db)

    db_session = SessionModel(
        id=session_id,
        title=title,
        description=description,
        source=source,
        created_at_utc=now_utc,
        sample_rate_hz=sample_rate_hz,
        status="recording",
        duration_seconds=0,
        sample_count=0,
        calibration_snapshot=json.dumps(cal_snapshot),
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    return SessionRecordSchema(
        id=db_session.id,
        title=db_session.title,
        description=db_session.description,
        source=db_session.source,
        createdAt=db_session.created_at_utc,
        endTime=None,
        durationSeconds=0,
        sampleCount=0,
        sampleRateHz=db_session.sample_rate_hz,
        status=db_session.status,
        peakLoads={},
        calibrationSnapshot=cal_snapshot,
    )


def add_readings_batch(db: Session, session_id: str, frames: List[TelemetryFrameSchema]):
    db_session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not db_session:
        return

    now_utc = datetime.now(timezone.utc).isoformat()

    for frame in frames:
        for sensor_id, reading in frame.readings.items():
            db_reading = ReadingModel(
                session_id=session_id,
                timestamp_ms=frame.timestamp,
                timestamp_utc=now_utc,
                formatted_time=frame.formattedTime,
                sensor_id=sensor_id,
                raw_adc=reading.rawAdc,
                filtered_value=reading.filteredValue,
                normalized_percent=reading.normalizedPercent,
                status=reading.status,
            )
            db.add(db_reading)

    db_session.sample_count += len(frames)
    if db_session.sample_rate_hz > 0:
        db_session.duration_seconds = int(db_session.sample_count / db_session.sample_rate_hz)

    db.commit()


def _parse_cal_snapshot(raw: str) -> Dict[str, int]:
    """Safely parse a calibration_snapshot JSON string."""
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return {}


def stop_session(db: Session, session_id: str) -> Optional[SessionDetailSchema]:
    db_session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not db_session:
        return None

    now_utc = datetime.now(timezone.utc).isoformat()
    db_session.end_time_utc = now_utc
    db_session.status = "completed"

    if db_session.sample_rate_hz > 0:
        db_session.duration_seconds = int(db_session.sample_count / db_session.sample_rate_hz)

    db.commit()

    return get_session_by_id(db, session_id)


def get_all_sessions(db: Session) -> List[SessionRecordSchema]:
    sessions = db.query(SessionModel).order_by(SessionModel.created_at_utc.desc()).all()
    results = []
    for s in sessions:
        # Calculate peak load per sensor from readings
        readings = db.query(ReadingModel).filter(ReadingModel.session_id == s.id).all()
        peak_loads: Dict[str, int] = {}
        for r in readings:
            if r.sensor_id not in peak_loads or r.normalized_percent > peak_loads[r.sensor_id]:
                peak_loads[r.sensor_id] = r.normalized_percent

        results.append(
            SessionRecordSchema(
                id=s.id,
                title=s.title,
                description=s.description,
                source=s.source,
                createdAt=s.created_at_utc,
                endTime=s.end_time_utc,
                durationSeconds=s.duration_seconds,
                sampleCount=s.sample_count,
                sampleRateHz=s.sample_rate_hz,
                status=s.status,
                peakLoads=peak_loads,
                calibrationSnapshot=_parse_cal_snapshot(s.calibration_snapshot),
            )
        )
    return results


def get_session_by_id(db: Session, session_id: str) -> Optional[SessionDetailSchema]:
    s = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not s:
        return None

    readings = db.query(ReadingModel).filter(ReadingModel.session_id == session_id).order_by(ReadingModel.timestamp_ms.asc()).all()

    # Reconstruct frames dictionary
    frames_dict: Dict[float, TelemetryFrameSchema] = {}
    peak_loads: Dict[str, int] = {}

    for r in readings:
        if r.sensor_id not in peak_loads or r.normalized_percent > peak_loads[r.sensor_id]:
            peak_loads[r.sensor_id] = r.normalized_percent

        if r.timestamp_ms not in frames_dict:
            frames_dict[r.timestamp_ms] = TelemetryFrameSchema(
                timestamp=r.timestamp_ms,
                formattedTime=r.formatted_time,
                readings={},
            )

        frames_dict[r.timestamp_ms].readings[r.sensor_id] = SingleReadingSchema(
            id=r.sensor_id,
            name=r.sensor_id,
            type="fsr" if "fsr" in r.sensor_id else "flex",
            rawAdc=r.raw_adc,
            filteredValue=r.filtered_value,
            normalizedPercent=r.normalized_percent,
            unit="ADC",
            minRaw=0,
            maxRaw=4095,
            status=r.status,
            lastUpdated=r.timestamp_ms,
        )

    frames_list = list(frames_dict.values())

    return SessionDetailSchema(
        id=s.id,
        title=s.title,
        description=s.description,
        source=s.source,
        createdAt=s.created_at_utc,
        endTime=s.end_time_utc,
        durationSeconds=s.duration_seconds,
        sampleCount=s.sample_count,
        sampleRateHz=s.sample_rate_hz,
        status=s.status,
        peakLoads=peak_loads,
        calibrationSnapshot=_parse_cal_snapshot(s.calibration_snapshot),
        dataFrames=frames_list,
    )


def delete_session(db: Session, session_id: str) -> bool:
    s = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not s:
        return False
    db.delete(s)
    db.commit()
    return True


def generate_session_csv(db: Session, session_id: str) -> Optional[str]:
    session = get_session_by_id(db, session_id)
    if not session:
        return None

    # Get active sensors
    sensor_configs = get_all_sensor_configs(db)
    sensor_ids = [c.id for c in sensor_configs if c.enabled]

    headers = ["Timestamp_ms", "Time_Formatted", "UTC_Timestamp"]
    for sid in sensor_ids:
        headers.extend([f"{sid}_RawADC", f"{sid}_Filtered", f"{sid}_NormPercent"])

    csv_lines = [",".join(headers)]

    for frame in session.dataFrames:
        row = [str(frame.timestamp), f'"{frame.formattedTime}"', f'"{session.createdAt}"']
        for sid in sensor_ids:
            r = frame.readings.get(sid)
            if r:
                row.extend([str(r.rawAdc), str(r.filteredValue), str(r.normalizedPercent)])
            else:
                row.extend(["", "", ""])
        csv_lines.append(",".join(row))

    return "\n".join(csv_lines)
