import React, { useState, useMemo } from 'react';
import { useSensor } from '../context/SensorContext';
import { SensorConfig, SessionRecord, TelemetryFrame, SensorReading } from '../types/sensor';
import {
  applyMovingAverageFilter,
  applyLowPassFilter,
  calculateSignalStats,
  computeFFT,
  WindowFunction,
} from '../utils/signalProcessing';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const SlidersIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"></line>
    <line x1="4" y1="10" x2="4" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12" y2="3"></line>
    <line x1="20" y1="21" x2="20" y2="16"></line>
    <line x1="20" y1="12" x2="20" y2="3"></line>
    <line x1="1" y1="14" x2="7" y2="14"></line>
    <line x1="9" y1="8" x2="15" y2="8"></line>
    <line x1="17" y1="16" x2="23" y2="16"></line>
  </svg>
);

const ZapIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

export const AnalysisPage: React.FC = () => {
  const { historyBuffer, savedSessions, configs, dataSource, systemMetrics } = useSensor();

  // Selection states
  const [selectedSessionId, setSelectedSessionId] = useState<string>('live');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('fsr_palm');
  const [filterType, setFilterType] = useState<'none' | 'moving_avg' | 'lowpass'>('moving_avg');
  const [movingAvgWindow, setMovingAvgWindow] = useState<number>(7);
  const [cutoffFreqHz, setCutoffFreqHz] = useState<number>(5.0);
  const [fftWindow, setFftWindow] = useState<WindowFunction>('hanning');
  const [timeWindowSec, setTimeWindowSec] = useState<number>(0); // 0 = Full range

  // Available signals list including 6 sensor channels + IMU derived signals
  const channelOptions = useMemo(() => {
    const list = configs.map((cfg: SensorConfig) => ({
      id: cfg.id,
      name: `${cfg.name} (${cfg.pin})`,
      category: 'Sensors',
    }));
    list.push(
      { id: 'imu_accel_mag', name: 'IMU Accel Magnitude (g)', category: 'IMU Motion' },
      { id: 'imu_gyro_mag', name: 'IMU Gyro Magnitude (°/s)', category: 'IMU Motion' },
      { id: 'imu_pitch', name: 'IMU Pitch Angle (°)', category: 'IMU Motion' },
      { id: 'imu_roll', name: 'IMU Roll Angle (°)', category: 'IMU Motion' }
    );
    return list;
  }, [configs]);

  // Extract signal series and timestamps based on session or live buffer selection
  const rawData = useMemo(() => {
    let frames = historyBuffer;
    if (selectedSessionId !== 'live') {
      const sess = savedSessions.find((s: SessionRecord) => s.id === selectedSessionId);
      if (sess && sess.dataFrames && sess.dataFrames.length > 0) {
        frames = sess.dataFrames;
      }
    }

    if (!frames || frames.length === 0) return { signal: [], timestamps: [], timesFormatted: [], source: dataSource };

    // Apply time windowing filter if set
    let windowedFrames = frames;
    if (timeWindowSec > 0 && frames.length > 0) {
      const lastTs = frames[frames.length - 1].timestamp;
      const minTs = lastTs - timeWindowSec * 1000;
      windowedFrames = frames.filter((f: TelemetryFrame) => f.timestamp >= minTs);
    }

    const signal: number[] = [];
    const timestamps: number[] = [];
    const timesFormatted: string[] = [];

    windowedFrames.forEach((frame: TelemetryFrame) => {
      let val = 0;
      if (selectedChannelId.startsWith('imu_')) {
        const imu = frame.imu;
        if (selectedChannelId === 'imu_accel_mag') val = imu ? imu.accelMag : 1.0;
        else if (selectedChannelId === 'imu_gyro_mag') val = imu ? imu.gyroMag : 0.0;
        else if (selectedChannelId === 'imu_pitch') val = imu ? imu.pitch : 0.0;
        else if (selectedChannelId === 'imu_roll') val = imu ? imu.roll : 0.0;
      } else {
        const r = frame.readings[selectedChannelId];
        val = r ? r.rawAdc : 0;
      }
      signal.push(val);
      timestamps.push(frame.timestamp);
      timesFormatted.push(frame.formattedTime || new Date(frame.timestamp).toLocaleTimeString());
    });

    const activeSess = savedSessions.find((s: SessionRecord) => s.id === selectedSessionId);
    const resolvedSource = selectedSessionId === 'live' ? dataSource : (activeSess?.source || 'simulated');

    return { signal, timestamps, timesFormatted, source: resolvedSource };
  }, [selectedSessionId, selectedChannelId, timeWindowSec, historyBuffer, savedSessions, dataSource]);

  // Compute effective sampling frequency from timestamps
  const effectiveFsHz = useMemo(() => {
    if (rawData.timestamps.length < 2) return systemMetrics.sampleRateHz || 50;
    const durSec = (rawData.timestamps[rawData.timestamps.length - 1] - rawData.timestamps[0]) / 1000.0;
    if (durSec <= 0) return 50;
    return Number(((rawData.timestamps.length - 1) / durSec).toFixed(1));
  }, [rawData.timestamps, systemMetrics.sampleRateHz]);

  // Compute filtered signal
  const filteredSignal = useMemo(() => {
    if (filterType === 'moving_avg') {
      return applyMovingAverageFilter(rawData.signal, movingAvgWindow);
    } else if (filterType === 'lowpass') {
      return applyLowPassFilter(rawData.signal, effectiveFsHz, cutoffFreqHz);
    }
    return rawData.signal;
  }, [rawData.signal, filterType, movingAvgWindow, cutoffFreqHz, effectiveFsHz]);

  // Combined chart data payload
  const chartData = useMemo(() => {
    return rawData.signal.map((rawVal, idx) => ({
      index: idx,
      time: rawData.timesFormatted[idx] || `${idx}`,
      raw: rawVal,
      filtered: Math.round(filteredSignal[idx] * 100) / 100,
    }));
  }, [rawData.signal, rawData.timesFormatted, filteredSignal]);

  // Statistical metrics calculation
  const stats = useMemo(() => {
    return calculateSignalStats(filteredSignal, rawData.timestamps);
  }, [filteredSignal, rawData.timestamps]);

  // FFT spectral analysis computation
  const fftResult = useMemo(() => {
    return computeFFT(filteredSignal, effectiveFsHz, fftWindow);
  }, [filteredSignal, effectiveFsHz, fftWindow]);

  const isImuSignal = selectedChannelId.startsWith('imu_');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F3F6FA] flex items-center gap-2">
            <ActivityIcon className="text-[#35D0C1] w-6 h-6" />
            Signal Analysis & Spectral FFT
          </h1>
          <p className="text-sm text-[#A5B2C5] mt-1">
            Perform digital signal processing, windowed FFT frequency extraction, and statistical metrics.
          </p>
        </div>

        {/* Global Data Source & Sampling Rate Badge */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-[#141F31] border border-[#29384D] text-xs font-mono">
            Source:{' '}
            <span className={rawData.source === 'esp32_hardware' ? 'text-[#43C98B] font-bold' : 'text-[#35D0C1] font-bold'}>
              {rawData.source === 'esp32_hardware' ? 'ESP32 HARDWARE' : 'SIMULATED DEMO'}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#141F31] border border-[#29384D] text-xs font-mono">
            Sample Rate: <span className="text-[#F3F6FA] font-bold">{effectiveFsHz} Hz</span>
          </div>
        </div>
      </div>

      {/* Control Panel: Session & Signal Selection */}
      <div className="p-5 rounded-xl bg-[#141F31] border border-[#29384D] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Session Selector */}
        <div>
          <label className="block text-xs font-mono text-[#A5B2C5] uppercase mb-1.5">
            Select Data Source Session
          </label>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#1B2A40] text-[#F3F6FA] border border-[#29384D] text-sm focus:border-[#35D0C1] outline-none"
          >
            <option value="live">[Live] Real-Time Telemetry Buffer ({historyBuffer.length} pts)</option>
            {savedSessions.map((s: SessionRecord) => (
              <option key={s.id} value={s.id}>
                [Session] {s.title} ({s.sampleCount} pts - {s.source})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Channel Selector */}
        <div>
          <label className="block text-xs font-mono text-[#A5B2C5] uppercase mb-1.5">
            Target Channel / Derived Signal
          </label>
          <select
            value={selectedChannelId}
            onChange={(e) => setSelectedChannelId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#1B2A40] text-[#F3F6FA] border border-[#29384D] text-sm focus:border-[#35D0C1] outline-none"
          >
            {channelOptions.map((opt: { id: string; name: string; category: string }) => (
              <option key={opt.id} value={opt.id}>
                {opt.category === 'IMU Motion' ? '[IMU] ' : '[Sensor] '} {opt.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Filter Controls */}
        <div>
          <label className="block text-xs font-mono text-[#A5B2C5] uppercase mb-1.5">
            Filter Method
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg bg-[#1B2A40] text-[#F3F6FA] border border-[#29384D] text-sm focus:border-[#35D0C1] outline-none"
          >
            <option value="none">Raw Signal (No Filter)</option>
            <option value="moving_avg">Moving Average Filter</option>
            <option value="lowpass">Low-Pass EMA Filter</option>
          </select>
        </div>

        {/* 4. Time Windowing */}
        <div>
          <label className="block text-xs font-mono text-[#A5B2C5] uppercase mb-1.5">
            Time Range Window
          </label>
          <select
            value={timeWindowSec}
            onChange={(e) => setTimeWindowSec(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg bg-[#1B2A40] text-[#F3F6FA] border border-[#29384D] text-sm focus:border-[#35D0C1] outline-none"
          >
            <option value={0}>Full Recorded Range</option>
            <option value={5}>Last 5 Seconds</option>
            <option value={10}>Last 10 Seconds</option>
            <option value={30}>Last 30 Seconds</option>
          </select>
        </div>
      </div>

      {/* Filter Parameters Tuning Bar */}
      {filterType !== 'none' && (
        <div className="p-4 rounded-xl bg-[#141F31]/80 border border-[#29384D] flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <SlidersIcon className="text-[#35D0C1] w-4 h-4" />
            <span className="text-xs font-mono text-[#F3F6FA] uppercase">Filter Tuning:</span>
          </div>

          {filterType === 'moving_avg' && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#A5B2C5]">Window Size ({movingAvgWindow} samples):</span>
              <input
                type="range"
                min="3"
                max="31"
                step="2"
                value={movingAvgWindow}
                onChange={(e) => setMovingAvgWindow(Number(e.target.value))}
                className="w-36 accent-[#35D0C1]"
              />
            </div>
          )}

          {filterType === 'lowpass' && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#A5B2C5]">Cutoff Frequency ({cutoffFreqHz} Hz):</span>
              <input
                type="range"
                min="0.5"
                max={Math.floor(effectiveFsHz / 2)}
                step="0.5"
                value={cutoffFreqHz}
                onChange={(e) => setCutoffFreqHz(Number(e.target.value))}
                className="w-36 accent-[#35D0C1]"
              />
            </div>
          )}
        </div>
      )}

      {/* Empty / Short Data State Warning */}
      {rawData.signal.length < 8 && (
        <div className="p-6 rounded-xl bg-[#141F31] border border-[#F4B860]/40 text-center space-y-2">
          <AlertTriangleIcon className="w-8 h-8 text-[#F4B860] mx-auto" />
          <h3 className="text-base font-bold text-[#F3F6FA]">Insufficient Telemetry Samples</h3>
          <p className="text-xs text-[#A5B2C5] max-w-md mx-auto">
            At least 8 data frames are required to render signal plots and calculate spectral FFT.
            Currently available: <strong className="text-[#F4B860]">{rawData.signal.length} points</strong>.
          </p>
        </div>
      )}

      {/* Statistical Feature Cards */}
      {rawData.signal.length >= 8 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-[#141F31] border border-[#29384D]">
            <span className="text-[10px] font-mono text-[#A5B2C5] uppercase block">Mean Signal</span>
            <span className="text-lg font-bold font-mono text-[#F3F6FA]">{stats.mean}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141F31] border border-[#29384D]">
            <span className="text-[10px] font-mono text-[#A5B2C5] uppercase block">Std Deviation</span>
            <span className="text-lg font-bold font-mono text-[#35D0C1]">{stats.std}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141F31] border border-[#29384D]">
            <span className="text-[10px] font-mono text-[#A5B2C5] uppercase block">RMS Voltage / Force</span>
            <span className="text-lg font-bold font-mono text-[#43C98B]">{stats.rms}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141F31] border border-[#29384D]">
            <span className="text-[10px] font-mono text-[#A5B2C5] uppercase block">Peak-to-Peak (Vp-p)</span>
            <span className="text-lg font-bold font-mono text-[#F4B860]">{stats.peakToPeak}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141F31] border border-[#29384D]">
            <span className="text-[10px] font-mono text-[#A5B2C5] uppercase block">Range [Min, Max]</span>
            <span className="text-xs font-bold font-mono text-[#F3F6FA]">{stats.min} – {stats.max}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#141F31] border border-[#29384D]">
            <span className="text-[10px] font-mono text-[#A5B2C5] uppercase block">Dominant Frequency</span>
            <span className="text-lg font-bold font-mono text-[#EC4899]">
              {fftResult.isValid ? `${fftResult.dominantFrequencyHz} Hz` : 'N/A'}
            </span>
          </div>
        </div>
      )}

      {/* Main Signal Plot (Raw vs Filtered Overlay) */}
      {rawData.signal.length >= 8 && (
        <div className="p-5 rounded-xl bg-[#141F31] border border-[#29384D]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#F3F6FA]">Time Domain Signal Plot</h2>
              <p className="text-xs text-[#A5B2C5]">
                Displaying {rawData.signal.length} samples ({effectiveFsHz} Hz sampling rate)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#38BDF8]">
                <span className="w-3 h-0.5 bg-[#38BDF8] inline-block" /> Raw Signal
              </span>
              <span className="flex items-center gap-1.5 text-[#35D0C1]">
                <span className="w-3 h-0.5 bg-[#35D0C1] inline-block" /> Filtered Signal
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#29384D" />
                <XAxis dataKey="time" stroke="#A5B2C5" tick={{ fill: '#A5B2C5', fontSize: 10 }} />
                <YAxis stroke="#A5B2C5" tick={{ fill: '#A5B2C5', fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141F31', borderColor: '#29384D', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="raw" stroke="#38BDF8" strokeWidth={1} dot={false} name="Raw Input" opacity={0.6} />
                <Line type="monotone" dataKey="filtered" stroke="#35D0C1" strokeWidth={2.5} dot={false} name="Filtered Output" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Spectral FFT Analysis Section */}
      {rawData.signal.length >= 8 && fftResult.isValid && (
        <div className="p-5 rounded-xl bg-[#141F31] border border-[#29384D] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#F3F6FA] flex items-center gap-2">
                <ZapIcon className="text-[#EC4899] w-4 h-4" />
                Fast Fourier Transform (FFT) Power Spectrum
              </h2>
              <p className="text-xs text-[#A5B2C5]">
                Frequency domain magnitude decomposition (0 Hz to Nyquist frequency {effectiveFsHz / 2} Hz)
              </p>
            </div>

            {/* Window Selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A5B2C5]">FFT Window:</span>
              <select
                value={fftWindow}
                onChange={(e) => setFftWindow(e.target.value as WindowFunction)}
                className="px-2.5 py-1 rounded bg-[#1B2A40] text-[#F3F6FA] border border-[#29384D] text-xs font-mono"
              >
                <option value="hanning">Hanning Window</option>
                <option value="hamming">Hamming Window</option>
                <option value="rectangular">Rectangular Window</option>
              </select>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fftResult.spectrum} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#29384D" />
                <XAxis dataKey="frequencyHz" stroke="#A5B2C5" tick={{ fill: '#A5B2C5', fontSize: 10 }} unit=" Hz" />
                <YAxis stroke="#A5B2C5" tick={{ fill: '#A5B2C5', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141F31', borderColor: '#29384D', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="magnitude" fill="#EC4899" radius={[4, 4, 0, 0]} name="Magnitude" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Experimental Motion Analysis (IMU Signals) */}
      {isImuSignal && (
        <div className="p-5 rounded-xl bg-[#1B2A40]/60 border border-[#35D0C1]/40 space-y-3">
          <div className="flex items-center gap-2">
            <ActivityIcon className="text-[#35D0C1] w-5 h-5" />
            <h3 className="text-sm font-bold text-[#F3F6FA] uppercase tracking-wider">
              Experimental Motion & Tremor Analysis
            </h3>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0B1220]/60 border border-[#29384D] text-xs text-[#A5B2C5] space-y-2 font-mono">
            <p className="text-[#F4B860] flex items-center gap-1.5 font-bold">
              <AlertTriangleIcon className="w-4 h-4 text-[#F4B860]" />
              RESEARCH & ALGORITHM NOTICE:
            </p>
            <p>
              This section provides automated biomechanical signal feature extraction (e.g., tremor frequency band power in 3–12 Hz range).
              These metrics are intended strictly for scientific research and device verification and <strong>do not constitute medical diagnosis or clinical monitoring</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPage;
