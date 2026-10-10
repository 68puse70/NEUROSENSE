export type SensorType = 'fsr' | 'flex' | 'emg';

export type SensorStatus = 'normal' | 'warning' | 'error' | 'stale' | 'disconnected';

export interface SensorReading {
  id: string;
  name: string;
  type: SensorType;
  rawAdc: number;          // 12-bit ESP32 ADC: 0 - 4095
  filteredValue: number;   // Filtered/smoothed value
  filteredAdc?: number;    // Filtered/smoothed 12-bit ADC value
  normalizedPercent: number; // 0 - 100% mapped calibration
  unit: string;
  minRaw: number;
  maxRaw: number;
  status: SensorStatus;
  lastUpdated: number;
}

export interface IMUReading {
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  pitch: number;
  roll: number;
  accelMag: number;
  gyroMag: number;
}

export interface TelemetryFrame {
  timestamp: number;
  formattedTime: string;
  readings: Record<string, SensorReading>;
  imu?: IMUReading;
}

export interface CalibrationData {
  zeroOffset: number; // Tare offset raw ADC
  minAdc: number;     // Zero force / flex
  maxAdc: number;     // Full scale pressure / 90-degree flex
  scaleFactor: number;
  tareApplied: boolean;
  version?: number;
  source?: string;
  lastCalibratedAt?: string;
}

export interface SensorConfig {
  id: string;
  name: string;
  type: SensorType;
  pin: string;
  enabled: boolean;
  color: string;
  location: 'palm' | 'flex_thumb' | 'flex_index' | 'flex_middle' | 'flex_ring' | 'flex_pinky';
  calibration: CalibrationData;
}

export interface SessionRecord {
  id: string;
  title: string;
  description: string;
  source?: string;
  createdAt: string;
  endTime?: string;
  durationSeconds: number;
  sampleCount: number;
  sampleRateHz: number;
  status?: string;
  peakLoads: Record<string, number>;
  dataFrames: TelemetryFrame[];
}

export interface CalibrationProfile {
  id: string;
  name: string;
  updatedAt: string;
  configs: Record<string, CalibrationData>;
}

export type StreamStatus = 'streaming' | 'paused' | 'disconnected' | 'stale';
export type DataSourceType = 'simulated' | 'esp32_hardware';
export type WsConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface SimulatorSettings {
  noiseLevel: number;        // 0.0 to 0.2
  enableArtifacts: boolean;  // Inject occasional voltage spikes/dropouts
  enableDrift: boolean;      // Baseline temperature/strain drift simulation
  gesturePattern: 'pinch' | 'grip' | 'wave' | 'random';
}

export interface SystemMetrics {
  sampleRateHz: number;
  bufferSize: number;
  snrDb: number;
  latencyMs: number;
  staleCount: number;
  droppedPackets: number;
}
