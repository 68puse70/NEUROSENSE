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
    info: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="10" y1="11" x2="14" y2="11"></line>
        <line x1="10" y1="8" x2="14" y2="8"></line>
      </svg>
    ),
  };

  const IconComponent = icons[name];
  return IconComponent ?? null;
};

export const HandVisualization: React.FC = () => {
  const { configs, latestFrame, selectedSensorId, setSelectedSensorId } = useSensor();

  // Color gradient function based on normalized percentage 0-100%
  const getNodeColor = (percent: number = 0, defaultColor: string) => {
    if (percent > 85) return '#F07178'; // Red / saturation
    if (percent > 60) return '#F4B860'; // Warning yellow
    if (percent > 20) return defaultColor;
    return '#29384D'; // Rest state dark
  };

  const getReading = (id: string) => {
    return latestFrame?.readings[id];
  };

  // Node position map on hand SVG coordinate space (300 x 380)
  const nodeMap: Record<string, { x: number; y: number; label: string; type: 'fsr' | 'flex' }> = {
    fsr_thumb: { x: 55, y: 160, label: 'Thumb FSR', type: 'fsr' },
    fsr_index: { x: 95, y: 55, label: 'Index FSR', type: 'fsr' },
    fsr_middle: { x: 145, y: 40, label: 'Middle FSR', type: 'fsr' },
    fsr_ring: { x: 195, y: 55, label: 'Ring FSR', type: 'fsr' },
    fsr_pinky: { x: 245, y: 100, label: 'Pinky FSR', type: 'fsr' },
    fsr_palm: { x: 150, y: 240, label: 'Palm FSR', type: 'fsr' },
    flex_thumb: { x: 80, y: 200, label: 'Thumb Flex', type: 'flex' },
    flex_index: { x: 108, y: 130, label: 'Index Flex', type: 'flex' },
    flex_middle: { x: 148, y: 120, label: 'Middle Flex', type: 'flex' },
    flex_ring: { x: 188, y: 130, label: 'Ring Flex', type: 'flex' },
    flex_pinky: { x: 228, y: 165, label: 'Pinky Flex', type: 'flex' },
  };

  const selectedSensor = configs.find((c) => c.id === selectedSensorId);
  const selectedReading = selectedSensorId ? getReading(selectedSensorId) : null;

  return (
    <div className="lab-card p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3 border-b border-[#29384D] pb-3">
        <div>
          <h3 className="text-sm font-bold text-[#F3F6FA] uppercase tracking-wider flex items-center gap-2">
            <Icon name="activity" size={4} color="#35D0C1" />
            Anatomical Sensor Heatmap
          </h3>
          <p className="text-xs text-[#A5B2C5]">
            Real-time FSR tactile pressure & Flex joint curvature mapping
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1B2A40] text-[#35D0C1] border border-[#29384D]">
          Interactive 2D Hand
        </span>
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 py-2">
        {/* SVG Anatomical Hand Blueprint */}
        <div className="relative w-[280px] h-[340px] flex items-center justify-center bg-[#0B1220]/60 rounded-xl border border-[#29384D] p-2 shadow-inner">
          <svg
            viewBox="0 0 300 380"
            className="w-full h-full drop-shadow-[0_0_10px_rgba(53,208,193,0.1)]"
          >
            {/* Hand Silhouette Outline */}
            <path
              d="M 100,370 L 100,300 C 70,280 40,240 30,190 C 25,160 40,140 60,150 L 80,180 C 80,140 85,75 95,45 C 100,30 115,30 118,50 L 128,110 C 130,70 135,25 145,20 C 155,15 165,25 162,60 L 160,115 C 170,75 180,40 195,40 C 205,40 212,50 208,80 L 198,130 C 215,90 230,80 245,85 C 255,90 255,110 245,135 L 225,200 C 220,250 210,300 200,370 Z"
              fill="#101A2B"
              stroke="#29384D"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Bone / Joint Structure Lines */}
            <path
              d="M 150,350 L 150,230 M 150,230 L 70,185 M 150,230 L 105,125 M 150,230 L 148,115 M 150,230 L 188,125 M 150,230 L 225,160"
              stroke="#1B2A40"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Interactive Sensor Nodes */}
            {configs.map((config) => {
              const node = nodeMap[config.id];
              if (!node || !config.enabled) return null;

              const reading = getReading(config.id);
              const percent = reading ? reading.normalizedPercent : 0;
              const isSelected = selectedSensorId === config.id;
              const nodeColor = getNodeColor(percent, config.color);
              const radius = node.type === 'fsr' ? 14 : 10;

              return (
                <g
                  key={config.id}
                  onClick={() => setSelectedSensorId(config.id)}
                  className="cursor-pointer"
                >
                  {/* Selection Pulse Ring */}
{isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius + 7}
                        fill="none"
                        stroke="#35D0C1"
                        strokeWidth="2"
                      />
                    )}

                  {/* Outer Heatmap Glow */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + (percent / 100) * 8}
                    fill={nodeColor}
                    opacity={0.3}
                  />

                  {/* Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill={nodeColor}
                    stroke={isSelected ? '#35D0C1' : '#141F31'}
                    strokeWidth={isSelected ? '3' : '2'}
                  />

                  {/* Node Label Text inside */}
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fill="#0B1220"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {percent}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Sensor Detail Callout */}
        <div className="w-full md:w-56 bg-[#0B1220] rounded-xl p-4 border border-[#29384D] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#29384D] pb-2 mb-3">
              <span className="text-[11px] font-mono text-[#A5B2C5] flex items-center gap-1">
                <Icon name="info" size={3.5} color="#35D0C1" />
                FOCUSED SENSOR
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1B2A40] text-[#35D0C1]">
                {selectedSensor?.type.toUpperCase() ?? 'NONE'}
              </span>
            </div>

            {selectedSensor ? (
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-[#F3F6FA]">{selectedSensor.name}</h4>
                  <p className="text-xs font-mono text-[#A5B2C5]">{selectedSensor.pin}</p>
                </div>

                <div className="bg-[#141F31] p-3 rounded-lg border border-[#29384D]">
                  <div className="text-[10px] font-mono text-[#A5B2C5] uppercase">Live Normalized Load</div>
                  <div className="text-2xl font-mono font-bold text-[#35D0C1] mt-0.5">
                    {selectedReading ? `${selectedReading.normalizedPercent}%` : '0%'}
                  </div>
                  <div className="w-full bg-[#1B2A40] h-2 rounded-full mt-2 overflow-hidden border border-[#29384D]">
                    <div
                      className="h-full bg-[#35D0C1]"
                      style={{ width: `${selectedReading?.normalizedPercent ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-[#141F31] p-2 rounded border border-[#29384D]">
                    <span className="text-[10px] text-[#A5B2C5] block">Raw ADC</span>
                    <strong className="text-[#F3F6FA] text-sm">{selectedReading?.rawAdc ?? 0}</strong>
                  </div>
                  <div className="bg-[#141F31] p-2 rounded border border-[#29384D]">
                    <span className="text-[10px] text-[#A5B2C5] block">Filtered</span>
                    <strong className="text-[#35D0C1] text-sm">{selectedReading?.filteredValue ?? 0}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#A5B2C5] italic">Select a node on the hand diagram to inspect telemetry.</p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#29384D] text-[10px] font-mono text-[#A5B2C5]">
            Click any sensor node to change focus.
          </div>
        </div>
      </div>
    </div>
  );
};
