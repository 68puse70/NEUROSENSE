import React, { useState } from 'react';
import { useSensor } from '../../context/SensorContext';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const PauseIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

const RefreshCwIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

export const LiveTelemetryChart: React.FC = () => {
  const { historyBuffer, configs, streamStatus, systemMetrics } = useSensor();
  const [metricMode, setMetricMode] = useState<'percent' | 'raw' | 'filtered'>('percent');
  const [timeWindowPoints, setTimeWindowPoints] = useState<number>(60);
  const [isChartFrozen, setIsChartFrozen] = useState<boolean>(false);
  const [frozenHistory, setFrozenHistory] = useState<typeof historyBuffer>([]);

  // Track visibility toggles per sensor channel
  const [visibleChannels, setVisibleChannels] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    configs.forEach((c) => {
      initial[c.id] = c.enabled;
    });
    return initial;
  });

  const toggleChannel = (id: string) => {
    setVisibleChannels((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const showAllChannels = () => {
    const next: Record<string, boolean> = {};
    configs.forEach((c) => {
      next[c.id] = true;
    });
    setVisibleChannels(next);
  };

  const toggleFreeze = () => {
    if (!isChartFrozen) {
      setFrozenHistory([...historyBuffer]);
    }
    setIsChartFrozen(!isChartFrozen);
  };

  const activeBuffer = isChartFrozen ? frozenHistory : historyBuffer;
  const slicedFrames = activeBuffer.slice(-timeWindowPoints);

  const chartData = slicedFrames.map((frame) => {
    const point: Record<string, any> = {
      time: frame.formattedTime || new Date(frame.timestamp).toLocaleTimeString(),
      timestamp: frame.timestamp,
    };

    Object.values(frame.readings).forEach((reading) => {
      if (metricMode === 'percent') {
        point[reading.id] = reading.normalizedPercent;
      } else if (metricMode === 'filtered') {
        point[reading.id] = reading.filteredValue;
      } else {
        point[reading.id] = reading.rawAdc;
      }
    });

    return point;
  });

  const enabledConfigs = configs.filter((c) => c.enabled);

  return (
    <div className="p-5 rounded-xl bg-[#141F31] border border-[#29384D] space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#29384D] pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-sm bg-[#35D0C1]" />
          <div>
            <h2 className="text-base font-bold text-[#F3F6FA] tracking-tight">
              Real-Time Telemetry Multi-Channel Stream
            </h2>
            <p className="text-xs font-mono text-[#A5B2C5]">
              {streamStatus === 'streaming' ? 'Active 50Hz Packet Stream' : 'Stream Paused'}{' '}
              ({systemMetrics.sampleRateHz} Hz Measured)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Freeze Toggle Button */}
          <button
            onClick={toggleFreeze}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center transition-colors border ${
              isChartFrozen
                ? 'bg-[#F4B860]/20 text-[#F4B860] border-[#F4B860]/50'
                : 'bg-[#141F31] text-[#A5B2C5] border-[#29384D]'
            }`}
          >
            {isChartFrozen ? (
              <>
                <PlayIcon className="w-3 h-3 mr-1" /> Unfreeze
              </>
            ) : (
              <>
                <PauseIcon className="w-3 h-3 mr-1" /> Freeze Inspection
              </>
            )}
          </button>

          {/* Metric Mode Selector */}
          <div className="bg-[#0B1220] p-1 rounded-lg border border-[#29384D] flex text-xs font-mono">
            <button
              onClick={() => setMetricMode('percent')}
              className={`px-2 py-0.5 rounded transition-colors ${
                metricMode === 'percent'
                  ? 'bg-[#35D0C1] text-[#0B1220] font-semibold'
                  : 'text-[#A5B2C5]'
              }`}
            >
              Norm %
            </button>
            <button
              onClick={() => setMetricMode('raw')}
              className={`px-2 py-0.5 rounded transition-colors ${
                metricMode === 'raw'
                  ? 'bg-[#35D0C1] text-[#0B1220] font-semibold'
                  : 'text-[#A5B2C5]'
              }`}
            >
              Raw ADC
            </button>
            <button
              onClick={() => setMetricMode('filtered')}
              className={`px-2 py-0.5 rounded transition-colors ${
                metricMode === 'filtered'
                  ? 'bg-[#35D0C1] text-[#0B1220] font-semibold'
                  : 'text-[#A5B2C5]'
              }`}
            >
              Filtered
            </button>
          </div>

          {/* Window Size Select */}
          <select
            value={timeWindowPoints}
            onChange={(e) => setTimeWindowPoints(Number(e.target.value))}
            className="bg-[#0B1220] border border-[#29384D] rounded-lg px-2.5 py-1 text-xs font-mono text-[#F3F6FA] focus:outline-none"
          >
            <option value={30}>30 Frames</option>
            <option value={60}>60 Frames</option>
            <option value={120}>120 Frames</option>
            <option value={200}>200 Frames</option>
          </select>
        </div>
      </div>

      {/* Channel Filter Controls */}
      <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
        <div className="flex flex-wrap gap-1.5">
          {enabledConfigs.map((cfg) => {
            const isVisible = visibleChannels[cfg.id] ?? false;
            return (
              <button
                key={cfg.id}
                onClick={() => toggleChannel(cfg.id)}
                className={`flex items-center px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                  isVisible
                    ? 'bg-[#1B2A40] text-[#F3F6FA] border-[#29384D]'
                    : 'bg-[#0B1220]/50 text-[#A5B2C5]/50 border-transparent'
                }`}
              >
                <span className="w-2 h-2 rounded-sm mr-1.5 shrink-0" style={{ backgroundColor: cfg.color }} />
                {isVisible ? (
                  <EyeIcon className="w-3 h-3 mr-1 text-[#35D0C1]" />
                ) : (
                  <EyeOffIcon className="w-3 h-3 mr-1 text-[#A5B2C5]" />
                )}
                {cfg.name}
              </button>
            );
          })}
        </div>

        <button
          onClick={showAllChannels}
          className="text-xs font-mono text-[#35D0C1] flex items-center hover:underline"
        >
          <RefreshCwIcon className="w-3 h-3 mr-1" /> Reset Channels
        </button>
      </div>

      {/* Chart Canvas Container */}
      <div className="h-72 w-full">
        {slicedFrames.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs font-mono text-[#A5B2C5]">
            Waiting for telemetry data stream frames...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#29384D" opacity={0.6} />
              <XAxis dataKey="time" stroke="#A5B2C5" tick={{ fill: '#A5B2C5', fontSize: 10 }} />
              <YAxis
                stroke="#A5B2C5"
                tick={{ fill: '#A5B2C5', fontSize: 10 }}
                domain={metricMode === 'percent' ? [0, 100] : ['auto', 'auto']}
                unit={metricMode === 'percent' ? '%' : ''}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#141F31',
                  borderColor: '#29384D',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
              />
              {enabledConfigs.map((cfg) => {
                if (!visibleChannels[cfg.id]) return null;
                return (
                  <Line
                    key={cfg.id}
                    type="monotone"
                    dataKey={cfg.id}
                    name={cfg.name}
                    stroke={cfg.color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default LiveTelemetryChart;
