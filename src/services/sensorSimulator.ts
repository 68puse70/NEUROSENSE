import { SensorConfig, SensorReading, TelemetryFrame, SimulatorSettings } from '../types/sensor';

export const INITIAL_SENSOR_CONFIGS: SensorConfig[] = [
  // FSR Sensor (Force-Sensitive Resistor) - Palm
  {
    id: 'fsr_palm',
    name: 'FSR Palm Pressure',
    type: 'fsr',
    pin: 'A0 (GPIO36)',
    enabled: true,
    color: '#F59E0B', // Amber
    location: 'palm',
    calibration: { zeroOffset: 140, minAdc: 140, maxAdc: 3900, scaleFactor: 1.0, tareApplied: true, version: 1, source: 'factory' },
  },

  // Flex Sensors
  {
    id: 'flex_thumb',
    name: 'Flex Thumb Joint',
    type: 'flex',
    pin: 'A1 (GPIO39)',
    enabled: true,
    color: '#35D0C1', // Teal
    location: 'flex_thumb',
    calibration: { zeroOffset: 1450, minAdc: 1450, maxAdc: 3400, scaleFactor: 1.0, tareApplied: true, version: 1, source: 'factory' },
  },
  {
    id: 'flex_index',
    name: 'Flex Index Joint',
    type: 'flex',
    pin: 'A2 (GPIO34)',
    enabled: true,
    color: '#43C98B', // Green
    location: 'flex_index',
    calibration: { zeroOffset: 1400, minAdc: 1400, maxAdc: 3500, scaleFactor: 1.0, tareApplied: true, version: 1, source: 'factory' },
  },
  {
    id: 'flex_middle',
    name: 'Flex Middle Joint',
    type: 'flex',
    pin: 'A3 (GPIO35)',
    enabled: true,
    color: '#38BDF8', // Sky blue
    location: 'flex_middle',
    calibration: { zeroOffset: 1420, minAdc: 1420, maxAdc: 3550, scaleFactor: 1.0, tareApplied: true, version: 1, source: 'factory' },
  },
  {
    id: 'flex_ring',
    name: 'Flex Ring Joint',
    type: 'flex',
    pin: 'A4 (GPIO32)',
    enabled: true,
    color: '#A855F7', // Purple
    location: 'flex_ring',
    calibration: { zeroOffset: 1380, minAdc: 1380, maxAdc: 3480, scaleFactor: 1.0, tareApplied: true, version: 1, source: 'factory' },
  },
  {
    id: 'flex_pinky',
    name: 'Flex Pinky Joint',
    type: 'flex',
    pin: 'A5 (GPIO33)',
    enabled: true,
    color: '#EC4899', // Pink
    location: 'flex_pinky',
    calibration: { zeroOffset: 1350, minAdc: 1350, maxAdc: 3420, scaleFactor: 1.0, tareApplied: true, version: 1, source: 'factory' },
  },
];

const lastFilteredValues: Record<string, number> = {};

export class SensorSimulator {
  private phase = 0;
  private settings: SimulatorSettings = {
    noiseLevel: 0.03,
    enableArtifacts: false,
    enableDrift: false,
    gesturePattern: 'pinch',
  };

  constructor() {
    INITIAL_SENSOR_CONFIGS.forEach((cfg) => {
      lastFilteredValues[cfg.id] = cfg.calibration.minAdc;
    });
  }

  public updateSettings(newSettings: Partial<SimulatorSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  public getSettings(): SimulatorSettings {
    return { ...this.settings };
  }

  public generateFrame(
    configs: SensorConfig[],
    timestamp: number = Date.now()
  ): TelemetryFrame {
    this.phase += 0.05;

    const cycleTime = (this.phase % (Math.PI * 6));
    const pinchEnvelope = Math.max(0, Math.sin(cycleTime));
    const gripEnvelope = Math.max(0, Math.sin(cycleTime / 2 - Math.PI / 4));
    const flexWave = Math.sin(this.phase * 0.8) * 0.5 + 0.5;

    // Optional baseline thermal drift simulation
    const driftOffset = this.settings.enableDrift ? Math.sin(this.phase * 0.05) * 80 : 0;

    const readings: Record<string, SensorReading> = {};

    configs.forEach((config) => {
      if (!config.enabled) {
        readings[config.id] = {
          id: config.id,
          name: config.name,
          type: config.type,
          rawAdc: 0,
          filteredValue: 0,
          normalizedPercent: 0,
          unit: config.type === 'fsr' ? 'ADC (Force)' : 'ADC (Deg)',
          minRaw: config.calibration.minAdc,
          maxRaw: config.calibration.maxAdc,
          status: 'disconnected',
          lastUpdated: timestamp,
        };
        return;
      }

      const { minAdc, maxAdc } = config.calibration;
      const range = Math.max(1, maxAdc - minAdc);

      let targetNormalized = 0;

      if (this.settings.gesturePattern === 'pinch') {
        if (config.location === 'flex_thumb' || config.location === 'flex_index') {
          targetNormalized = pinchEnvelope * 0.85 + gripEnvelope * 0.3;
        } else if (config.location === 'palm') {
          targetNormalized = gripEnvelope * 0.4 + pinchEnvelope * 0.5;
        } else {
          targetNormalized = gripEnvelope * 0.5;
        }
      } else if (this.settings.gesturePattern === 'grip') {
        targetNormalized = gripEnvelope * 0.9 + pinchEnvelope * 0.2;
      } else if (this.settings.gesturePattern === 'wave') {
        targetNormalized = flexWave * 0.8;
      } else {
        // Random
        targetNormalized = Math.abs(Math.sin(this.phase + config.pin.length * 2));
      }

      // Add baseline noise & drift
      targetNormalized += (Math.sin(this.phase * 2 + config.pin.length) * 0.02);
      targetNormalized = Math.max(0, Math.min(1.0, targetNormalized));

      let targetAdc = minAdc + targetNormalized * range + driftOffset;

      // Gaussian Noise
      const noise = (Math.random() + Math.random() - 1) * this.settings.noiseLevel * range;
      let rawAdc = Math.round(targetAdc + noise);

      // Artifact Spikes / Dropouts for testing warning & error UI states
      if (this.settings.enableArtifacts && Math.random() < 0.08) {
        rawAdc = Math.random() < 0.5 ? 4095 : 0;
      }

      rawAdc = Math.max(0, Math.min(4095, rawAdc));

      // EMA Low-Pass Filter
      const prevFiltered = lastFilteredValues[config.id] ?? rawAdc;
      const filteredValue = Math.round(prevFiltered * 0.75 + rawAdc * 0.25);
      lastFilteredValues[config.id] = filteredValue;

      // Normalized percentage mapping
      const normalizedPercent = Math.max(
        0,
        Math.min(100, Math.round(((filteredValue - minAdc) / range) * 100))
      );

      // Status determination
      let status: 'normal' | 'warning' | 'error' | 'stale' | 'disconnected' = 'normal';
      if (rawAdc >= 4050) {
        status = 'warning'; // Saturation risk
      } else if (rawAdc === 0 && this.settings.enableArtifacts) {
        status = 'error'; // Drop-out
      }

      readings[config.id] = {
        id: config.id,
        name: config.name,
        type: config.type,
        rawAdc,
        filteredValue,
        normalizedPercent,
        unit: config.type === 'fsr' ? 'ADC (Force)' : 'ADC (Deg)',
        minRaw: minAdc,
        maxRaw: maxAdc,
        status,
        lastUpdated: timestamp,
      };
    });

    const dateObj = new Date(timestamp);
    const formattedTime =
      dateObj.toTimeString().split(' ')[0] +
      '.' +
      String(dateObj.getMilliseconds()).padStart(3, '0');

    const accelX = Number((Math.sin(this.phase * 1.2) * 0.5 + (Math.random() - 0.5) * 0.05).toFixed(2));
    const accelY = Number((Math.cos(this.phase * 0.8) * 0.3 + (Math.random() - 0.5) * 0.05).toFixed(2));
    const accelZ = Number((9.81 + Math.sin(this.phase * 0.5) * 0.4 + (Math.random() - 0.5) * 0.05).toFixed(2));
    const gyroX = Number((Math.sin(this.phase * 3.0) * 15.0).toFixed(2));
    const gyroY = Number((Math.cos(this.phase * 2.5) * 12.0).toFixed(2));
    const gyroZ = Number((Math.sin(this.phase * 1.5) * 8.0).toFixed(2));
    const pitch = Number((Math.sin(this.phase * 0.4) * 25.0).toFixed(1));
    const roll = Number((Math.cos(this.phase * 0.4) * 20.0).toFixed(1));
    const accelMag = Number(Math.sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ).toFixed(2));
    const gyroMag = Number(Math.sqrt(gyroX * gyroX + gyroY * gyroY + gyroZ * gyroZ).toFixed(2));

    return {
      timestamp,
      formattedTime,
      readings,
      imu: {
        accelX,
        accelY,
        accelZ,
        gyroX,
        gyroY,
        gyroZ,
        pitch,
        roll,
        accelMag,
        gyroMag,
      },
    };
  }
}
