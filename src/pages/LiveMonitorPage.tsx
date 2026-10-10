import React, { useState } from 'react';
import { useSensor } from '../context/SensorContext';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';

type Icons = {
  [key: string]: React.ReactElement;
};

const Icon = ({ name, size = 14, color = '#35D0C1', className }: { name: string; size?: number; color?: string; className?: string }) => {
  const icons: Icons = {
    activity: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>
    ),
    download: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    ),
    sliders: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    ),
    table: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="3" y1="15" x2="21" y2="15"></line>
        <line x1="9" y1="3" x2="9" y2="21"></line>
        <line x1="15" y1="3" x2="15" y2="21"></line>
      </svg>
    ),
    filter: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="M21 21l-4.3-4.3"></path>
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
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

export const LiveMonitorPage: React.FC = () => {
  const { configs, historyBuffer, latestFrame, exportSessionCSV } = useSensor();
  const [filterType, setFilterType] = useState<'all' | 'fsr' | 'flex'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [focusChannelId, setFocusChannelId] = useState<string>('fsr_thumb');

  const filteredConfigs = configs.filter((c) => {
    if (!c.enabled) return false;
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const focusConfig = configs.find((c) => c.id === focusChannelId);
  const focusReading = latestFrame?.readings[focusChannelId];

  // Single channel waveform data
  const focusChartData = historyBuffer.slice(-100).map((frame) => {
    const reading = frame.readings[focusChannelId];
    return {
      time: frame.formattedTime,
      raw: reading ? reading.rawAdc : 0,
      filtered: reading ? reading.filteredValue : 0,
      percent: reading ? reading.normalizedPercent : 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141F31] p-5 rounded-xl border border-[#29384D]">
        <div>
          <h2 className="text-xl font-bold text-[#F3F6FA] uppercase tracking-wider flex items-center gap-2">
            <Icon name="activity" size={5} color="#35D0C1" />
            Live Waveform & Matrix Monitor
          </h2>
          <p className="text-xs text-[#A5B2C5] mt-0.5">
            High-resolution multi-channel real-time signal analysis & digital telemetry table
          </p>
        </div>
        <button
          onClick={() => exportSessionCSV()}
          className="flex items-center px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-[#35D0C1] text-[#0B1220] self-start sm:self-auto"
        >
          <Icon name="download" size={4} mr-2 />
          Export Live Telemetry Buffer (CSV)
        </button>
      </div>

      {/* Single Focused Channel Deep Dive */}
      {focusConfig && (
        <div className="lab-card p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#29384D] pb-3 mb-4 gap-3">
            <div className="flex items-center space-x-3">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: focusConfig.color }}
              />
              <div>
                <h3 className="text-base font-bold text-[#F3F6FA]">{focusConfig.name}: Focused Channel Analysis</h3>
                <span className="text-xs font-mono text-[#A5B2C5]">{focusConfig.pin} | {focusConfig.type.toUpperCase()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 font-mono text-xs">
              <div className="bg-[#0B1220] px-3 py-1.5 rounded-lg border border-[#29384D]">
                Raw ADC: <strong className="text-[#F3F6FA]">{focusReading?.rawAdc ?? 0}</strong>
              </div>
              <div className="bg-[#0B1220] px-3 py-1.5 rounded-lg border border-[#29384D]">
                Filtered: <strong className="text-[#35D0C1]">{focusReading?.filteredValue ?? 0}</strong>
              </div>
              <div className="bg-[#0B1220] px-3 py-1.5 rounded-lg border border-[#29384D]">
                Normalized: <strong className="text-[#43C98B]">{focusReading?.normalizedPercent ?? 0}%</strong>
              </div>
            </div>
          </div>

          <div className="w-full h-64 bg-[#0B1220] rounded-xl p-2 border border-[#29384D]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={focusChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#29384D" opacity={0.6} />
                <XAxis dataKey="time" stroke="#A5B2C5" fontSize={10} fontFamily="monospace" />
                <YAxis stroke="#A5B2C5" fontSize={10} fontFamily="monospace" domain={[0, 4095]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141F31',
                    borderColor: '#29384D',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#F3F6FA',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="raw"
                  name="Raw ADC (12-bit)"
                  stroke="#F4B860"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="filtered"
                  name="Filtered Signal"
                  stroke={focusConfig.color}
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Telemetry Matrix Table */}
      <div className="lab-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#29384D] gap-3">
          <h3 className="text-sm font-bold text-[#F3F6FA] uppercase tracking-wider flex items-center gap-2">
            <Icon name="table" size={4} color="#35D0C1" />
            Live Channel Telemetry Matrix
          </h3>

          <div className="flex items-center space-x-2">
            {/* Type Filter */}
            <div className="flex items-center bg-[#0B1220] rounded-lg border border-[#29384D] px-2 py-1 text-xs font-mono">
              <Icon name="filter" size={3.5} color="#35D0C1" />
              <button
                onClick={() => setFilterType('all')}
                className={`px-2 py-0.5 rounded ${filterType === 'all' ? 'bg-[#35D0C1] text-[#0B1220] font-bold' : 'text-[#A5B2C5]'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('fsr')}
                className={`px-2 py-0.5 rounded ${filterType === 'fsr' ? 'bg-[#35D0C1] text-[#0B1220] font-bold' : 'text-[#A5B2C5]'}`}
              >
                FSR
              </button>
              <button
                onClick={() => setFilterType('flex')}
                className={`px-2 py-0.5 rounded ${filterType === 'flex' ? 'bg-[#35D0C1] text-[#0B1220] font-bold' : 'text-[#A5B2C5]'}`}
              >
                Flex
              </button>
            </div>

            {/* Search input */}
            <div className="relative">
              <Icon name="search" size={3.5} color="#A5B2C5" />
              <input
                type="text"
                placeholder="Search channel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#0B1220] border border-[#29384D] rounded-lg pl-8 pr-3 py-1 text-xs font-mono text-[#F3F6FA] focus:outline-none focus:border-[#35D0C1]"
              />
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#29384D] text-[#A5B2C5] uppercase text-[10px]">
                <th className="py-2.5 px-3">Channel Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">MCU Pin</th>
                <th className="py-2.5 px-3">Raw ADC (0-4095)</th>
                <th className="py-2.5 px-3">Filtered ADC</th>
                <th className="py-2.5 px-3">Normalized %</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#29384D]/50">
              {filteredConfigs.map((config) => {
                const reading = latestFrame?.readings[config.id];
                const isFocused = focusChannelId === config.id;
                const percent = reading ? reading.normalizedPercent : 0;

                return (
<tr
                  key={config.id}
                  className={`bg-[#1B2A40]/80 ${isFocused ? 'bg-[#1B2A40]/80' : ''}`}
                >
                    <td className="py-3 px-3 font-bold text-[#F3F6FA] flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <span>{config.name}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#0B1220] text-[#35D0C1] border border-[#29384D]">
                        {config.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#A5B2C5]">{config.pin}</td>
                    <td className="py-3 px-3 text-[#F3F6FA]">{reading?.rawAdc ?? 0}</td>
                    <td className="py-3 px-3 text-[#35D0C1] font-semibold">{reading?.filteredValue ?? 0}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-8 font-bold">{percent}%</span>
                        <div className="w-20 bg-[#0B1220] h-1.5 rounded-full overflow-hidden border border-[#29384D]">
                          <div
                            className="h-full bg-[#35D0C1]"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[#43C98B] flex items-center gap-1 text-[10px]">
                        <Icon name="zap" className="w-3 h-3" /> NORMAL
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setFocusChannelId(config.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono border ${
                          isFocused
                            ? 'bg-[#35D0C1] text-[#0B1220] font-bold border-[#35D0C1]'
                            : 'bg-[#1B2A40] text-[#A5B2C5] border-[#29384D]'
                        }`}
                      >
                        {isFocused ? 'Focused' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
