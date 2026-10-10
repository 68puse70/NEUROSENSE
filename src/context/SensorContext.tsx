import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  SensorConfig,
  TelemetryFrame,
  StreamStatus,
  DataSourceType,
  SessionRecord,
  CalibrationProfile,
  SystemMetrics,
  SimulatorSettings,
  WsConnectionState,
} from '../types/sensor';
import { INITIAL_SENSOR_CONFIGS, SensorSimulator } from '../services/sensorSimulator';
import { ApiClient } from '../services/apiClient';
import { WebSocketClient } from '../services/webSocketClient';

interface SensorContextType {
  configs: SensorConfig[];
  latestFrame: TelemetryFrame | null;
  historyBuffer: TelemetryFrame[];
  streamStatus: StreamStatus;
  dataSource: DataSourceType;
  sampleRateHz: number;
  isRecording: boolean;
  activeSession: Partial<SessionRecord> | null;
  savedSessions: SessionRecord[];
  calibrationProfiles: CalibrationProfile[];
  selectedSensorId: string | null;
  systemMetrics: SystemMetrics;
  simulatorSettings: SimulatorSettings;
  isBackendConnected: boolean;
  backendStatusText: string;
  wsConnectionState: WsConnectionState;
  wsReconnectAttempt: number;
  
  // Actions
  toggleStream: () => void;
  setSampleRateHz: (hz: number) => void;
  setDataSource: (source: DataSourceType) => void;
  setSelectedSensorId: (id: string | null) => void;
  updateSensorConfig: (id: string, updates: Partial<SensorConfig>) => void;
  updateSimulatorSettings: (updates: Partial<SimulatorSettings>) => void;
  startRecording: (title: string, description?: string) => void;
  stopRecording: () => void;
  deleteSession: (id: string) => void;
  applyTare: (sensorId: string) => void;
  applyMaxReference: (sensorId: string) => void;
  applyCalibration: (sensorId: string, minAdc: number, maxAdc: number) => void;
  applyGuidedCalibration: (sensorId: string, minAdc: number, maxAdc: number, zeroOffset?: number, source?: string, notes?: string) => Promise<boolean>;
  resetSensorToFactory: (sensorId: string) => Promise<void>;
  resetAllToFactory: () => Promise<void>;
  getCalibrationHistory: (sensorId: string) => Promise<any[]>;
  resetToFactoryCalibration: () => void;
  exportSessionCSV: (session?: SessionRecord) => void;
  loadSessionDetail: (id: string) => Promise<SessionRecord | null>;
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

const MAX_BUFFER_SIZE = 300;
const STALE_TIMEOUT_MS = 1500;

export const SensorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [configs, setConfigs] = useState<SensorConfig[]>(INITIAL_SENSOR_CONFIGS);
  const [latestFrame, setLatestFrame] = useState<TelemetryFrame | null>(null);
  const [historyBuffer, setHistoryBuffer] = useState<TelemetryFrame[]>([]);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('streaming');
  const [dataSource, setDataSourceState] = useState<DataSourceType>('simulated');
  const [sampleRateHz, setSampleRateHzState] = useState<number>(20);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>('fsr_thumb');

  const setDataSource = async (source: DataSourceType) => {
    setDataSourceState(source);
    if (isBackendConnected) {
      await ApiClient.setDeviceMode(source);
    }
  };
  
  // Backend & WebSocket states
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [backendStatusText, setBackendStatusText] = useState<string>('Checking backend...');
  const [wsConnectionState, setWsConnectionState] = useState<WsConnectionState>('disconnected');
  const [wsReconnectAttempt, setWsReconnectAttempt] = useState<number>(0);

  // Stale data timeout timer
  const staleTimerRef = useRef<number | null>(null);

  // Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<Partial<SessionRecord> | null>(null);
  const [recordedFrames, setRecordedFrames] = useState<TelemetryFrame[]>([]);
  const pendingBatchRef = useRef<TelemetryFrame[]>([]);

  // Simulator settings
  const [simulatorSettings, setSimulatorSettingsState] = useState<SimulatorSettings>({
    noiseLevel: 0.03,
    enableArtifacts: false,
    enableDrift: false,
    gesturePattern: 'pinch',
  });

  const [savedSessions, setSavedSessions] = useState<SessionRecord[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    sampleRateHz: 20,
    bufferSize: 0,
    snrDb: 42.5,
    latencyMs: 12,
    staleCount: 0,
    droppedPackets: 0,
  });

  const simulatorRef = useRef<SensorSimulator>(new SensorSimulator());
  const localTimerRef = useRef<number | null>(null);

  const [calibrationProfiles] = useState<CalibrationProfile[]>([
    {
      id: 'cal_default',
      name: 'Standard Bio-Cal Profile',
      updatedAt: new Date().toISOString(),
      configs: {},
    },
  ]);

  // Check Backend REST Health
  useEffect(() => {
    const checkBackend = async () => {
      const health = await ApiClient.checkHealth();
      if (health) {
        setIsBackendConnected(true);
        setBackendStatusText('FastAPI + SQLite Active');

        const dbConfigs = await ApiClient.fetchSensorConfigs();
        if (dbConfigs && dbConfigs.length > 0) {
          setConfigs(dbConfigs);
        }

        const dbSessions = await ApiClient.fetchAllSessions();
        if (dbSessions && dbSessions.length > 0) {
          setSavedSessions(dbSessions);
        }
      } else {
        setIsBackendConnected(false);
        setBackendStatusText('Backend Offline (Local Fallback)');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to WebSocket Streaming Manager Singleton
  useEffect(() => {
    const wsClient = WebSocketClient.getInstance();
    wsClient.connect('ws://127.0.0.1:8000/ws/telemetry');

    const unsubscribeState = wsClient.onStateChange((state, attempt) => {
      setWsConnectionState(state);
      setWsReconnectAttempt(attempt);
    });

    const handleFrame = (frame: TelemetryFrame) => {
      if (streamStatus === 'paused') return;

      setStreamStatus('streaming');
      setLatestFrame(frame);

      // Reset Stale Data Timeout Timer
      if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
      staleTimerRef.current = window.setTimeout(() => {
        setStreamStatus('stale');
        setSystemMetrics((prev) => ({ ...prev, staleCount: prev.staleCount + 1 }));
      }, STALE_TIMEOUT_MS);

      setHistoryBuffer((prev) => {
        const next = [...prev, frame];
        return next.length > MAX_BUFFER_SIZE ? next.slice(next.length - MAX_BUFFER_SIZE) : next;
      });

      if (isRecording && activeSession?.id) {
        setRecordedFrames((prev) => [...prev, frame]);
        pendingBatchRef.current.push(frame);

        if (pendingBatchRef.current.length >= 15 && isBackendConnected) {
          const batchToSend = [...pendingBatchRef.current];
          pendingBatchRef.current = [];
          ApiClient.appendReadings(activeSession.id, batchToSend);
        }
      }

      setSystemMetrics((prev) => ({
        ...prev,
        sampleRateHz,
        bufferSize: historyBuffer.length + 1,
        snrDb: Number((42 + Math.random() * 3).toFixed(1)),
        latencyMs: Math.round(5 + Math.random() * 4),
      }));
    };

    const unsubscribeFrame = wsClient.onFrame(handleFrame);

    return () => {
      unsubscribeState();
      unsubscribeFrame();
      if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
    };
  }, [streamStatus, isRecording, isBackendConnected, activeSession?.id, sampleRateHz, historyBuffer.length]);

  // Local Timer Fallback loop if WebSocket is disconnected
  useEffect(() => {
    if (wsConnectionState === 'connected' || streamStatus !== 'streaming') {
      if (localTimerRef.current) clearInterval(localTimerRef.current);
      return;
    }

    const intervalMs = Math.round(1000 / sampleRateHz);

    localTimerRef.current = window.setInterval(() => {
      const frame = simulatorRef.current.generateFrame(configs);
      setLatestFrame(frame);

      setHistoryBuffer((prev) => {
        const next = [...prev, frame];
        return next.length > MAX_BUFFER_SIZE ? next.slice(next.length - MAX_BUFFER_SIZE) : next;
      });

      if (isRecording && activeSession?.id) {
        setRecordedFrames((prev) => [...prev, frame]);
      }
    }, intervalMs);

    return () => {
      if (localTimerRef.current) clearInterval(localTimerRef.current);
    };
  }, [wsConnectionState, streamStatus, sampleRateHz, configs, isRecording, activeSession?.id]);

  const toggleStream = () => {
    setStreamStatus((prev) => (prev === 'streaming' ? 'paused' : 'streaming'));
  };

  const setSampleRateHz = (hz: number) => {
    setSampleRateHzState(hz);
  };

  const updateSensorConfig = async (id: string, updates: Partial<SensorConfig>) => {
    setConfigs((prev) =>
      prev.map((cfg) => (cfg.id === id ? { ...cfg, ...updates } : cfg))
    );
    if (isBackendConnected) {
      await ApiClient.updateSensorConfig(id, updates);
    }
  };

  const updateSimulatorSettings = (updates: Partial<SimulatorSettings>) => {
    setSimulatorSettingsState((prev) => {
      const next = { ...prev, ...updates };
      simulatorRef.current.updateSettings(next);
      return next;
    });
  };

  const startRecording = async (title: string, description: string = '') => {
    pendingBatchRef.current = [];
    setRecordedFrames([]);

    if (isBackendConnected) {
      const dbSession = await ApiClient.startSession(title, description, dataSource, sampleRateHz);
      if (dbSession) {
        setActiveSession(dbSession);
        setIsRecording(true);
        return;
      }
    }

    const newSession: Partial<SessionRecord> = {
      id: `sess_${Date.now()}`,
      title,
      description,
      source: dataSource,
      createdAt: new Date().toISOString(),
      durationSeconds: 0,
      sampleCount: 0,
      sampleRateHz,
      status: 'recording',
    };
    setActiveSession(newSession);
    setIsRecording(true);
  };

  const stopRecording = async () => {
    if (!activeSession || !activeSession.id) return;
    setIsRecording(false);

    if (isBackendConnected && pendingBatchRef.current.length > 0) {
      await ApiClient.appendReadings(activeSession.id, pendingBatchRef.current);
      pendingBatchRef.current = [];
    }

    if (isBackendConnected) {
      const stoppedSession = await ApiClient.stopSession(activeSession.id);
      if (stoppedSession) {
        setSavedSessions((prev) => [stoppedSession, ...prev.filter((s) => s.id !== stoppedSession.id)]);
        setActiveSession(null);
        return;
      }
    }

    const peakLoads: Record<string, number> = {};
    configs.forEach((cfg) => {
      let maxVal = 0;
      recordedFrames.forEach((frame) => {
        const reading = frame.readings[cfg.id];
        if (reading && reading.normalizedPercent > maxVal) {
          maxVal = reading.normalizedPercent;
        }
      });
      peakLoads[cfg.id] = maxVal;
    });

    const finalSession: SessionRecord = {
      id: activeSession.id,
      title: activeSession.title || 'Recorded Telemetry Session',
      description: activeSession.description || '',
      source: activeSession.source || dataSource,
      createdAt: activeSession.createdAt || new Date().toISOString(),
      durationSeconds: Math.round(recordedFrames.length / sampleRateHz),
      sampleCount: recordedFrames.length,
      sampleRateHz,
      status: 'completed',
      peakLoads,
      dataFrames: recordedFrames,
    };

    setSavedSessions((prev) => [finalSession, ...prev]);
    setActiveSession(null);
  };

  const deleteSession = async (id: string) => {
    setSavedSessions((prev) => prev.filter((s) => s.id !== id));
    if (isBackendConnected) {
      await ApiClient.deleteSession(id);
    }
  };

  const applyTare = async (sensorId: string) => {
    const currentReading = latestFrame?.readings[sensorId];
    if (!currentReading) return;

    const rawAdc = currentReading.rawAdc;

    setConfigs((prev) =>
      prev.map((cfg) => {
        if (cfg.id === sensorId) {
          return {
            ...cfg,
            calibration: {
              ...cfg.calibration,
              zeroOffset: rawAdc,
              minAdc: rawAdc,
              tareApplied: true,
              lastCalibratedAt: new Date().toISOString(),
            },
          };
        }
        return cfg;
      })
    );

    if (isBackendConnected) {
      await ApiClient.applyTare(sensorId, rawAdc);
    }
  };

  const applyMaxReference = async (sensorId: string) => {
    const currentReading = latestFrame?.readings[sensorId];
    if (!currentReading) return;

    const rawAdc = currentReading.rawAdc;

    setConfigs((prev) =>
      prev.map((cfg) => {
        if (cfg.id === sensorId) {
          return {
            ...cfg,
            calibration: {
              ...cfg.calibration,
              maxAdc: rawAdc,
              lastCalibratedAt: new Date().toISOString(),
            },
          };
        }
        return cfg;
      })
    );

    if (isBackendConnected) {
      await ApiClient.updateSensorConfig(sensorId, {
        calibration: {
          zeroOffset: configs.find((c) => c.id === sensorId)?.calibration.zeroOffset ?? 120,
          minAdc: configs.find((c) => c.id === sensorId)?.calibration.minAdc ?? 120,
          maxAdc: rawAdc,
          scaleFactor: 1.0,
          tareApplied: true,
        },
      });
    }
  };

  const applyCalibration = async (sensorId: string, minAdc: number, maxAdc: number) => {
    setConfigs((prev) =>
      prev.map((cfg) => {
        if (cfg.id === sensorId) {
          return {
            ...cfg,
            calibration: {
              ...cfg.calibration,
              minAdc,
              maxAdc,
              lastCalibratedAt: new Date().toISOString(),
            },
          };
        }
        return cfg;
      })
    );

    if (isBackendConnected) {
      await ApiClient.updateSensorConfig(sensorId, {
        calibration: {
          zeroOffset: minAdc,
          minAdc,
          maxAdc,
          scaleFactor: 1.0,
          tareApplied: true,
        },
      });
    }
  };

  const applyGuidedCalibration = async (
    sensorId: string,
    minAdc: number,
    maxAdc: number,
    zeroOffset?: number,
    source: string = 'guided',
    notes: string = ''
  ): Promise<boolean> => {
    if (isBackendConnected) {
      try {
        const result = await ApiClient.applyGuidedCalibration(sensorId, minAdc, maxAdc, zeroOffset, source, notes);
        if (result && result.config) {
          setConfigs((prev) => prev.map((cfg) => (cfg.id === sensorId ? result.config : cfg)));
          return true;
        }
      } catch (err) {
        console.error('Guided calibration error:', err);
        return false;
      }
    }

    // Local fallback update
    setConfigs((prev) =>
      prev.map((cfg) => {
        if (cfg.id === sensorId) {
          return {
            ...cfg,
            calibration: {
              ...cfg.calibration,
              minAdc,
              maxAdc,
              zeroOffset: zeroOffset ?? minAdc,
              version: (cfg.calibration.version || 1) + 1,
              source,
              lastCalibratedAt: new Date().toISOString(),
            },
          };
        }
        return cfg;
      })
    );
    return true;
  };

  const resetSensorToFactory = async (sensorId: string) => {
    if (isBackendConnected) {
      const resetConfig = await ApiClient.resetSensorToFactory(sensorId);
      if (resetConfig) {
        setConfigs((prev) => prev.map((c) => (c.id === sensorId ? resetConfig : c)));
        return;
      }
    }
    const defaultCfg = INITIAL_SENSOR_CONFIGS.find((c) => c.id === sensorId);
    if (defaultCfg) {
      setConfigs((prev) => prev.map((c) => (c.id === sensorId ? defaultCfg : c)));
    }
  };

  const resetAllToFactory = async () => {
    if (isBackendConnected) {
      const resetConfigs = await ApiClient.resetAllToFactory();
      if (resetConfigs) {
        setConfigs(resetConfigs);
        return;
      }
    }
    setConfigs(INITIAL_SENSOR_CONFIGS);
  };

  const getCalibrationHistory = async (sensorId: string): Promise<any[]> => {
    if (isBackendConnected) {
      const history = await ApiClient.fetchCalibrationHistory(sensorId);
      if (history) return history;
    }
    return [];
  };

  const resetToFactoryCalibration = () => {
    resetAllToFactory();
  };

  const loadSessionDetail = async (id: string): Promise<SessionRecord | null> => {
    if (isBackendConnected) {
      const detail = await ApiClient.fetchSessionDetail(id);
      if (detail) return detail;
    }
    return savedSessions.find((s) => s.id === id) || null;
  };

  const exportSessionCSV = (session?: SessionRecord) => {
    if (session && isBackendConnected) {
      window.open(ApiClient.getCsvExportUrl(session.id), '_blank');
      return;
    }

    const framesToExport = session?.dataFrames.length ? session.dataFrames : historyBuffer;
    if (!framesToExport.length) return;

    const activeConfigIds = configs.filter((c) => c.enabled).map((c) => c.id);
    const headers = ['Timestamp_ms', 'Time_Formatted', ...activeConfigIds.flatMap((id) => [`${id}_RawADC`, `${id}_NormPercent`])];
    const csvRows = [headers.join(',')];

    framesToExport.forEach((frame) => {
      const row = [
        frame.timestamp,
        `"${frame.formattedTime}"`,
        ...activeConfigIds.flatMap((id): string[] => {
          const r = frame.readings[id];
          return r ? [String(r.rawAdc), String(r.normalizedPercent)] : ['', ''];
        }),
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${session?.title || 'neurosense_telemetry'}_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SensorContext.Provider
      value={{
        configs,
        latestFrame,
        historyBuffer,
        streamStatus,
        dataSource,
        sampleRateHz,
        isRecording,
        activeSession,
        savedSessions,
        calibrationProfiles,
        selectedSensorId,
        systemMetrics,
        simulatorSettings,
        isBackendConnected,
        backendStatusText,
        wsConnectionState,
        wsReconnectAttempt,
        toggleStream,
        setSampleRateHz,
        setDataSource,
        setSelectedSensorId,
        updateSensorConfig,
        updateSimulatorSettings,
        startRecording,
        stopRecording,
        deleteSession,
        applyTare,
        applyMaxReference,
        applyCalibration,
        applyGuidedCalibration,
        resetSensorToFactory,
        resetAllToFactory,
        getCalibrationHistory,
        resetToFactoryCalibration,
        exportSessionCSV,
        loadSessionDetail,
      }}
    >
      {children}
    </SensorContext.Provider>
  );
};

export const useSensor = () => {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error('useSensor must be used within a SensorProvider');
  }
  return context;
};
