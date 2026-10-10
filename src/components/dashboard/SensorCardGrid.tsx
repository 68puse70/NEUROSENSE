import React from 'react';
import { useSensor } from '../../context/SensorContext';

type Icons = {
  [key: string]: React.ReactElement;
};

const Icon = ({ name, size = 14, color = '#35D0C1' }: { name: string; size?: number; color?: string }) => {
  const icons: Icons = {
    activity: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>
    ),
    alerttriangle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ),
    checkcircle2: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    ),
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
    radio: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
      </svg>
    ),
    shieldalert: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ),
    wifioff: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="15" x2="16" y2="15"></line>
        <line x1="8" y1="9" x2="16" y2="9"></line>
        <line x1="8" y1="3" x2="16" y2="3"></line>
        <circle cx="8" cy="15" r="2"></circle>
        <circle cx="16" cy="15" r="2"></circle>
      </svg>
    ),
  };

  const IconComponent = icons[name];
  return IconComponent ?? null;
};

export const SensorCardGrid: React.FC = () => {
  const { configs, latestFrame, selectedSensorId, setSelectedSensorId, streamStatus, applyTare } = useSensor();

  return (
    <div className="lab-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#29384D] pb-3 mb-4 gap-2">
        <div>
          <h3 className="text-sm font-bold text-[#F3F6FA] uppercase tracking-wider flex items-center gap-2">
            <Icon name="cpu" size={4} color="#35D0C1" />
            Sensor Health & Telemetry Array
          </h3>
          <p className="text-xs text-[#A5B2C5]">
            Real-time channel status, signal freshness, ADC limits, and individual tare controls
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-[#1B2A40] text-[#35D0C1] border border-[#29384D]">
            {configs.filter((c) => c.enabled).length} Enabled
          </span>
          <span className="px-2 py-0.5 rounded bg-[#0B1220] text-[#A5B2C5] border border-[#29384D]">
            {configs.filter((c) => !c.enabled).length} Disabled
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
{configs.map((config) => {
          const reading = latestFrame?.readings[config.id];
          const isSelected = selectedSensorId === config.id;

          // Determine detailed health state
          let healthState: 'fresh' | 'stale' | 'disconnected' | 'warning' = 'fresh';
          let healthText = 'FRESH STREAM';
          let healthColor = 'text-[#43C98B]';

          if (!config.enabled) {
            healthState = 'disconnected';
            healthText = 'DISCONNECTED';
            healthColor = 'text-[#A5B2C5]';
          } else if (streamStatus === 'paused') {
            healthState = 'stale';
            healthText = 'STALE (PAUSED)';
            healthColor = 'text-[#F4B860]';
          } else if (reading && reading.normalizedPercent > 90) {
            healthState = 'warning';
            healthText = 'NEAR SATURATION';
            healthColor = 'text-[#F07178]';
          }

          const percent = reading ? reading.normalizedPercent : 0;
          const rawAdc = reading ? reading.rawAdc : 0;
          const filtered = reading ? reading.filteredValue : 0;

          return (
            <div
              key={config.id}
              onClick={() => setSelectedSensorId(config.id)}
              className={!config.enabled
                ? 'bg-[#0B1220]/40 border-[#29384D]/60 opacity-60'
                : isSelected
                ? 'bg-[#141F31] border-[#35D0C1]'
                : 'bg-[#0B1220] border-[#29384D]'}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: config.enabled ? config.color : '#29384D' }}
                  />
                  <h4 className="text-xs font-bold text-[#F3F6FA] truncate max-w-[110px]">
                    {config.name}
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1B2A40] text-[#A5B2C5] border border-[#29384D]">
                  {config.pin}
                </span>
              </div>

              {/* Progress & Values */}
              <div className="my-2">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[10px] font-mono text-[#A5B2C5] uppercase">
                    {config.type === 'fsr' ? 'Force Load' : 'Flex Angle'}
                  </span>
                  <span
                    className="text-base font-mono font-bold"
                    style={{ color: percent > 85 ? '#F07178' : percent > 60 ? '#F4B860' : '#35D0C1' }}
                  >
                    {config.enabled ? `${percent}%` : 'OFF'}
                  </span>
                </div>
                <div className="w-full bg-[#1B2A40] h-2 rounded-full overflow-hidden border border-[#29384D]">
                  <div
                    className="h-full"
                    style={{
                      width: config.enabled ? `${percent}%` : '0%',
                      backgroundColor: config.color,
                    }}
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono py-1.5 border-t border-[#29384D]/60 text-[#A5B2C5]">
                <div>
                  Raw: <strong className="text-[#F3F6FA]">{config.enabled ? rawAdc : 0}</strong>
                </div>
                <div>
                  Filtered: <strong className="text-[#35D0C1]">{config.enabled ? filtered : 0}</strong>
                </div>
              </div>

              {/* Health Footer */}
              <div className="mt-2 pt-1.5 border-t border-[#29384D]/40 flex items-center justify-between text-[10px] font-mono">
                <span className="flex items-center gap-1 font-semibold">
                  {healthState === 'fresh' && <Icon name="checkcircle2" size={3} color="#43C98B" />}
                  {healthState === 'stale' && <Icon name="alerttriangle" size={3} color="#F4B860" />}
                  {healthState === 'warning' && <Icon name="shieldalert" size={3} color="#F07178" />}
                  {healthState === 'disconnected' && <Icon name="wifioff" size={3} color="#A5B2C5" />}
                  {healthText}
                </span>

                {config.enabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      applyTare(config.id);
                    }}
                    className="px-1.5 py-0.5 rounded bg-[#1B2A40] text-[#35D0C1]"
                    title="Tare zero offset to current raw ADC"
                  >
                    Tare
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
