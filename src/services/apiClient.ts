import { SensorConfig, SessionRecord, TelemetryFrame } from '../types/sensor';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export class ApiClient {
  public static async checkHealth(): Promise<{ status: string; database: string; timestampUtc: string } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public static async fetchSensorConfigs(): Promise<SensorConfig[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/sensors`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public static async updateSensorConfig(id: string, updates: Partial<SensorConfig>): Promise<SensorConfig | null> {
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.enabled !== undefined) payload.enabled = updates.enabled;
      if (updates.calibration) {
        payload.minAdc = updates.calibration.minAdc;
        payload.maxAdc = updates.calibration.maxAdc;
        payload.zeroOffset = updates.calibration.zeroOffset;
      }
      const res = await fetch(`${API_BASE_URL}/sensors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public static async applyTare(id: string, rawAdc: number): Promise<SensorConfig | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/sensors/${id}/tare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawAdc }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public static async startSession(
    title: string,
    description: string = '',
    source: string = 'simulated',
    sampleRateHz: number = 20
  ): Promise<SessionRecord | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, source, sampleRateHz }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public static async appendReadings(sessionId: string, frames: TelemetryFrame[]): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frames }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public static async stopSession(sessionId: string): Promise<SessionRecord | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/stop`, {
        method: 'POST',
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public static async fetchAllSessions(): Promise<SessionRecord[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public static async fetchSessionDetail(id: string): Promise<SessionRecord | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public static async deleteSession(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public static async applyGuidedCalibration(
    id: string,
    minAdc: number,
    maxAdc: number,
    zeroOffset?: number,
    source: string = 'guided',
    notes: string = ''
  ): Promise<{ config: SensorConfig; validation: { isValid: boolean; error: string } } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/sensors/${id}/calibrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minAdc, maxAdc, zeroOffset, source, notes }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Calibration failed' }));
        throw new Error(errorData.detail || 'Calibration failed');
      }
      return await res.json();
    } catch (e: any) {
      throw e;
    }
  }

  public static async resetSensorToFactory(id: string): Promise<SensorConfig | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/sensors/${id}/reset-factory`, {
        method: 'POST',
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public static async resetAllToFactory(): Promise<SensorConfig[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/sensors/reset-all-factory`, {
        method: 'POST',
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public static async fetchCalibrationHistory(id: string): Promise<any[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/sensors/${id}/calibration-history`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public static async validateCalibration(minAdc: number, maxAdc: number): Promise<{ isValid: boolean; error: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/sensors/validate-calibration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minAdc, maxAdc }),
      });
      if (!res.ok) return { isValid: false, error: 'Validation request failed' };
      return await res.json();
    } catch {
      return { isValid: false, error: 'Validation network error' };
    }
  }

  public static async getDeviceStatus(): Promise<{
    status: string;
    mode: string;
    deviceId: string | null;
    lastSeenTimestampUtc: string | null;
    lastSeenMsAgo: number | null;
    packetsReceived: number;
    packetsDropped: number;
    acquisitionHz: number;
    wifiRssi: number | null;
    batteryVoltage: number | null;
    activeSensorsCount: number;
  } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/device/status`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public static async setDeviceMode(mode: 'simulated' | 'esp32_hardware'): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/device/mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public static getCsvExportUrl(sessionId: string): string {
    return `${API_BASE_URL}/sessions/${sessionId}/export.csv`;
  }
}
