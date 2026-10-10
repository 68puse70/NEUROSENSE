import React from 'react';
import { useSensor } from '../../context/SensorContext';

type Icons = {
  [key: string]: React.ReactElement;
};

const Icon = ({ name, size = 14, color = '#35D0C1' }: { name: string; size?: number; color?: string }) => {
  const icons: Icons = {
    cpu: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2"></rect>
        <rect x="9" y="9" width="6" height="6"></rect>
        <line x1="9" y1="1" x2="9" y2="4"></line>
        <line x1="15" y1="1" x2="15" y2="4"></line>
        <line x1="9" y1="20" x2="9" y2="23"></line>
        <line x1="15" y1="20" x2="15" y2="23"></line>
        <line x1="1" y1="9" x2="4" y2="9"></line>
        <line x1="1" y1="15" x2="4" y2="15"></line>
        <line x1="20" y1="9" x2="23" y2="9"></line>
        <line x1="20" y1="15" x2="23" y2="15"></line>
      </svg>
    ),
    gauge: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 8 12 16 12"></polyline>
      </svg>
    ),
    flame: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 11v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <path d="M12 19V5"></path>
        <path d="M19 11a4 4 0 0 1-4 4H7"></path>
        <path d="M3 11v6a2 2 0 0 0 2 2h2"></path>
        <path d="M21 11a4 4 0 0 1-4 4h-2"></path>
        <path d="M9 4h6"></path>
        <path d="M3 11V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"></path>
        <rect x="8" y="2" width="4" height="4" rx="1" ry="1"></rect>
        <rect x="16" y="2" width="4" height="4" rx="1" ry="1"></rect>
      </svg>
    ),
    shieldcheck: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4l10 6-10 6v-4"></path>
        <circle cx="12" cy="18" r="2"></circle>
      </svg>
    ),
    zap: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    ),
  };

  const IconComponent = icons[name];
  return IconComponent ?? null;
};

export const MetricsOverview: React.FC = () => {
  const { configs, latestFrame, systemMetrics } = useSensor();

  const enabledConfigs = configs.filter((c) => c.enabled);
  const totalChannels = enabledConfigs.length;

  let avgLoad = 0;
  let peakLoad = 0;
  let peakSensorName = 'N/A';

  if (latestFrame) {
    let sumPercent = 0;
    Object.values(latestFrame.readings).forEach((r) => {
      sumPercent += r.normalizedPercent;
      if (r.normalizedPercent > peakLoad) {
        peakLoad = r.normalizedPercent;
        peakSensorName = r.name;
      }
    });
    avgLoad = Math.round(sumPercent / (totalChannels || 1));
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Active Channels */}
      <div className="lab-card p-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-[#A5B2C5] uppercase flex items-center gap-1.5">
            <Icon name="cpu" size={3.5} color="#35D0C1" />
            Active Channels
          </div>
          <div className="text-2xl font-mono font-bold text-[#F3F6FA] mt-1">
            {totalChannels} <span className="text-xs font-normal text-[#A5B2C5]">/ {configs.length} Configured</span>
          </div>
          <div className="text-[11px] font-mono text-[#43C98B] mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#43C98B]" />
            1 FSR + 5 Flex Online
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[#1B2A40] border border-[#29384D] text-[#35D0C1]">
          <Icon name="zap" size={5} />
        </div>
      </div>

      {/* Average System Load */}
      <div className="lab-card p-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-[#A5B2C5] uppercase flex items-center gap-1.5">
            <Icon name="gauge" size={3.5} color="#38BDF8" />
            Average Tactile Load
          </div>
          <div className="text-2xl font-mono font-bold text-[#35D0C1] mt-1">
            {avgLoad}%
          </div>
          <div className="w-28 bg-[#0B1220] h-1.5 rounded-full mt-2 overflow-hidden border border-[#29384D]">
            <div className="h-full bg-[#35D0C1]"
              style={{ width: `${avgLoad}%` }}
            />
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[#1B2A40] border border-[#29384D] text-[#38BDF8]">
          <Icon name="gauge" size={5} />
        </div>
      </div>

      {/* Peak Load Sensor */}
      <div className="lab-card p-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-[#A5B2C5] uppercase flex items-center gap-1.5">
            <Icon name="flame" size={3.5} color="#F4B860" />
            Peak Channel Load
          </div>
          <div className="text-2xl font-mono font-bold text-[#F4B860] mt-1">
            {peakLoad}%
          </div>
          <div className="text-[11px] font-mono text-[#A5B2C5] mt-1 truncate max-w-[140px]">
            {peakSensorName}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[#1B2A40] border border-[#29384D] text-[#F4B860]">
          <Icon name="flame" size={5} />
        </div>
      </div>

      {/* Signal Health & Latency */}
      <div className="lab-card p-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-[#A5B2C5] uppercase flex items-center gap-1.5">
            <Icon name="shieldcheck" size={3.5} color="#43C98B" />
            Signal Fidelity
          </div>
          <div className="text-2xl font-mono font-bold text-[#43C98B] mt-1">
            {systemMetrics.snrDb} <span className="text-xs font-normal text-[#A5B2C5]">dB SNR</span>
          </div>
          <div className="text-[11px] font-mono text-[#A5B2C5] mt-1">
            Stream Latency: <strong className="text-[#F3F6FA]">{systemMetrics.latencyMs} ms</strong>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-[#1B2A40] border border-[#29384D] text-[#43C98B]">
          <Icon name="shieldcheck" size={5} />
        </div>
      </div>
    </div>
  );
};
