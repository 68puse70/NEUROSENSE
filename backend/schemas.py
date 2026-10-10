from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class CalibrationDataSchema(BaseModel):
    zeroOffset: int
    minAdc: int
    maxAdc: int
    scaleFactor: float
    tareApplied: bool
    lastCalibratedAt: Optional[str] = None
    # Phase 5: Calibration versioning
    version: int = 1
    source: str = "factory"  # 'factory' | 'guided' | 'manual' | 'tare'


class SensorConfigSchema(BaseModel):
    id: str
    name: str
    type: str
    pin: str
    enabled: bool
    color: str
    location: str
    calibration: CalibrationDataSchema


class SensorConfigUpdateSchema(BaseModel):
    name: Optional[str] = None
    enabled: Optional[bool] = None
    minAdc: Optional[int] = None
    maxAdc: Optional[int] = None
    zeroOffset: Optional[int] = None


class TareRequestSchema(BaseModel):
    rawAdc: int


class GuidedCalibrationSchema(BaseModel):
    """Phase 5: Payload for a complete guided or manual calibration."""
    minAdc: int = Field(..., ge=0, le=4095)
    maxAdc: int = Field(..., ge=0, le=4095)
    zeroOffset: Optional[int] = Field(None, ge=0, le=4095)
    source: str = Field("guided", pattern="^(guided|manual|tare)$")
    notes: str = ""


class CalibrationHistoryEntrySchema(BaseModel):
    id: int
    sensorId: str
    version: int
    minAdc: int
    maxAdc: int
    zeroOffset: int
    scaleFactor: float
    source: str
    createdAtUtc: str
    notes: str


class CalibrationValidationResultSchema(BaseModel):
    valid: bool
    error: str = ""
    normalizedSample: int = 0  # preview percent at current reading


class SingleReadingSchema(BaseModel):
    id: str
    name: str
    type: str
    rawAdc: int
    filteredValue: int
    normalizedPercent: int
    unit: str
    minRaw: int
    maxRaw: int
    status: str
    lastUpdated: float


class IMUReadingSchema(BaseModel):
    accelX: float = 0.0
    accelY: float = 0.0
    accelZ: float = 0.0
    gyroX: float = 0.0
    gyroY: float = 0.0
    gyroZ: float = 0.0
    pitch: float = 0.0
    roll: float = 0.0
    accelMag: float = 0.0
    gyroMag: float = 0.0


class TelemetryFrameSchema(BaseModel):
    timestamp: float
    formattedTime: str
    readings: Dict[str, SingleReadingSchema]
    imu: Optional[IMUReadingSchema] = None


class ReadingsBatchSchema(BaseModel):
    frames: List[TelemetryFrameSchema]


class SessionStartSchema(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = ""
    source: Optional[str] = "simulated"
    sampleRateHz: Optional[int] = 20


class SessionRecordSchema(BaseModel):
    id: str
    title: str
    description: str
    source: str
    createdAt: str
    endTime: Optional[str] = None
    durationSeconds: int
    sampleCount: int
    sampleRateHz: int
    status: str
    peakLoads: Dict[str, int] = {}
    calibrationSnapshot: Dict[str, int] = {}  # {sensorId: calibVersion}


class SessionDetailSchema(SessionRecordSchema):
    dataFrames: List[TelemetryFrameSchema] = []


class HealthResponseSchema(BaseModel):
    status: str
    database: str
    timestampUtc: str


# ──────────────────────────────────────────────────────────────
#  Phase 6: ESP32 Device Ingestion Schemas
# ──────────────────────────────────────────────────────────────

class ESP32SensorReadingSchema(BaseModel):
    sensorId: str
    rawAdc: int = Field(..., ge=0, le=4095)


from pydantic import BaseModel, Field, field_validator


class ESP32DevicePayloadSchema(BaseModel):
    """
    Validated telemetry packet submitted by ESP32 over HTTP POST.
    Supports dictionary map { "fsr_thumb": 2150, ... }
    """
    deviceId: str = Field(..., min_length=1)
    sequence: Optional[int] = 0
    deviceTimestampMs: Optional[int] = 0
    readings: Dict[str, int] = Field(..., description="Map of sensor ID to raw 12-bit ADC reading (0..4095)")
    imu: Optional[IMUReadingSchema] = None
    wifiRssi: Optional[int] = None
    batteryVoltage: Optional[float] = None

    @field_validator("readings")
    @classmethod
    def validate_adc_values(cls, v: Dict[str, int]) -> Dict[str, int]:
        for sensor_id, raw_adc in v.items():
            if raw_adc < 0 or raw_adc > 4095:
                raise ValueError(f"Sensor '{sensor_id}' raw ADC reading {raw_adc} is outside valid 12-bit range [0, 4095].")
        return v


class ESP32HeartbeatSchema(BaseModel):
    """Periodic health ping sent by ESP32."""
    deviceId: str = Field(..., min_length=1)
    uptimeSeconds: int = Field(..., ge=0)
    wifiRssi: int
    freeHeapBytes: Optional[int] = None
    firmwareVersion: Optional[str] = "1.0.0"


class DeviceStatusSchema(BaseModel):
    status: str  # 'connected' | 'stale' | 'disconnected'
    mode: str    # 'simulated' | 'esp32_hardware'
    deviceId: Optional[str] = None
    lastSeenTimestampUtc: Optional[str] = None
    lastSeenMsAgo: Optional[float] = None
    packetsReceived: int = 0
    packetsDropped: int = 0
    acquisitionHz: float = 0.0
    wifiRssi: Optional[int] = None
    batteryVoltage: Optional[float] = None
    activeSensorsCount: int = 0

