from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base


class SensorConfigModel(Base):
    __tablename__ = "sensor_configs"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # 'fsr' | 'flex' | 'emg'
    pin = Column(String, nullable=False)
    enabled = Column(Boolean, default=True)
    color = Column(String, nullable=False)
    location = Column(String, nullable=False)
    
    zero_offset = Column(Integer, default=120)
    min_adc = Column(Integer, default=120)
    max_adc = Column(Integer, default=3900)
    scale_factor = Column(Float, default=1.0)
    tare_applied = Column(Boolean, default=True)
    last_calibrated_at = Column(String, nullable=True)

    # Phase 5: Calibration versioning
    calibration_version = Column(Integer, default=1)
    calibration_source = Column(String, default="factory")  # 'factory' | 'guided' | 'manual' | 'tare'


class CalibrationHistoryModel(Base):
    """Immutable log of every calibration change for audit and session association."""
    __tablename__ = "calibration_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sensor_id = Column(String, nullable=False, index=True)
    version = Column(Integer, nullable=False)
    min_adc = Column(Integer, nullable=False)
    max_adc = Column(Integer, nullable=False)
    zero_offset = Column(Integer, nullable=False)
    scale_factor = Column(Float, default=1.0)
    source = Column(String, nullable=False)  # 'factory' | 'guided' | 'manual' | 'tare'
    created_at_utc = Column(String, nullable=False)
    notes = Column(String, default="")


class SessionModel(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    source = Column(String, default="simulated") # 'simulated' | 'esp32_hardware'
    created_at_utc = Column(String, nullable=False)
    end_time_utc = Column(String, nullable=True)
    duration_seconds = Column(Integer, default=0)
    sample_count = Column(Integer, default=0)
    sample_rate_hz = Column(Integer, default=20)
    status = Column(String, default="recording") # 'recording' | 'completed'

    # Phase 5: Track calibration snapshot at session start
    calibration_snapshot = Column(String, default="")  # JSON map: {sensorId: version}

    readings = relationship("ReadingModel", back_populates="session", cascade="all, delete-orphan")


class ReadingModel(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, ForeignKey("sessions.id"), index=True, nullable=False)
    timestamp_ms = Column(Float, nullable=False)
    timestamp_utc = Column(String, nullable=False)
    formatted_time = Column(String, nullable=False)
    sensor_id = Column(String, nullable=False, index=True)
    raw_adc = Column(Integer, nullable=False)
    filtered_value = Column(Integer, nullable=False)
    normalized_percent = Column(Integer, nullable=False)
    status = Column(String, default="normal")

    session = relationship("SessionModel", back_populates="readings")
