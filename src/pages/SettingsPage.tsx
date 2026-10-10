import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSensor } from '../context/SensorContext';

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const CpuIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
);

const RadioIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
  </svg>
);

const SaveIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
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

const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="12 2 15 8 21 8"></polyline>
    <polyline points="12 2 9 8 3 8"></polyline>
    <polyline points="12 22 15 16 21 16"></polyline>
    <polyline points="12 22 9 16 3 16"></polyline>
  </svg>
);

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

export const SettingsPage: React.FC = () => {
  const {
    configs,
    updateSensorConfig,
    dataSource,
    setDataSource,
    sampleRateHz,
    setSampleRateHz,
    simulatorSettings,
    updateSimulatorSettings,
  } = useSensor();

  const [wsUrl, setWsUrl] = useState('ws://192.168.1.100:8000/ws/telemetry');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141F31] p-5 rounded-xl border border-[#29384D]">
        <div>
          <h2 className="text-xl font-bold text-[#F3F6FA] uppercase tracking-wider flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#35D0C1]" />
            NeuroSense System Settings
          </h2>
          <p className="text-xs text-[#A5B2C5] mt-0.5">
            Configure channel display labels, sampling rate, simulation noise levels, and artifact injection
          </p>
        </div>
      </div>

      {/* In-Memory Disclaimer Notice */}
      <div className="bg-[#141F31] p-4 rounded-xl border border-[#29384D] flex items-center justify-between text-xs font-mono text-[#A5B2C5]">
        <div className="flex items-center space-x-2">
          <AlertCircleIcon className="w-4 h-4 text-[#F4B860] shrink-0" />
          <span>
            <strong className="text-[#F3F6FA]">Notice:</strong> Custom settings and channel labels are maintained in transient in-memory state. Settings will reset upon page reload until Phase 3 SQLite database.
          </span>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-[#43C98B]/20 border border-[#43C98B] p-4 rounded-xl flex items-center gap-2 text-xs font-mono text-[#43C98B]">
          <CheckCircleIcon className="w-4 h-4" />
          System settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSaveSystemSettings} className="space-y-6">
        {/* Simulation Controls Section */}
        <div className="lab-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#F3F6FA] uppercase tracking-wider flex items-center gap-2 border-b border-[#29384D] pb-3">
            <SparklesIcon className="w-4 h-4 text-[#35D0C1]" />
            Biomechanical Simulator Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Noise Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                <span className="text-[#A5B2C5]">ADC Noise Standard Deviation</span>
                <span className="text-[#35D0C1] font-bold">
                  {(simulatorSettings.noiseLevel * 100).toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={0.15}
                step={0.005}
                value={simulatorSettings.noiseLevel}
                onChange={(e) => updateSimulatorSettings({ noiseLevel: Number(e.target.value) })}
                className="w-full accent-[#35D0C1] bg-[#0B1220] cursor-pointer"
              />
            </div>

            {/* Gesture Pattern Selector */}
            <div>
              <label className="block text-xs font-mono text-[#A5B2C5] mb-1.5">Simulation Gesture Pattern</label>
              <select
                value={simulatorSettings.gesturePattern}
                onChange={(e) => updateSimulatorSettings({ gesturePattern: e.target.value as any })}
                className="w-full bg-[#0B1220] border border-[#29384D] rounded-lg px-3 py-2 text-sm text-[#F3F6FA] font-mono focus:outline-none focus:border-[#35D0C1]"
              >
                <option value="pinch">Pinch Flexion Cycle (Thumb + Index)</option>
                <option value="grip">Power Grip Contraction Cycle (All Channels)</option>
                <option value="wave">Sinusoidal Flex Wave</option>
                <option value="random">Random Biomechanical Noise</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#29384D]">
            {/* Artifact Injection Toggle */}
            <label className="flex items-center space-x-3 cursor-pointer p-3 bg-[#0B1220] rounded-lg border border-[#29384D]">
              <input
                type="checkbox"
                checked={simulatorSettings.enableArtifacts}
                onChange={(e) => updateSimulatorSettings({ enableArtifacts: e.target.checked })}
                className="accent-[#35D0C1] w-4 h-4 rounded"
              />
              <div>
                <span className="text-xs font-mono font-bold text-[#F3F6FA] block">Inject Artifact Spikes / Dropouts</span>
                <span className="text-[10px] text-[#A5B2C5]">Simulate occasional voltage spikes/floating pin dropouts to test warning states</span>
              </div>
            </label>

            {/* Baseline Thermal Drift */}
            <label className="flex items-center space-x-3 cursor-pointer p-3 bg-[#0B1220] rounded-lg border border-[#29384D]">
              <input
                type="checkbox"
                checked={simulatorSettings.enableDrift}
                onChange={(e) => updateSimulatorSettings({ enableDrift: e.target.checked })}
                className="accent-[#35D0C1] w-4 h-4 rounded"
              />
              <div>
                <span className="text-xs font-mono font-bold text-[#F3F6FA] block">Simulate Thermal Baseline Drift</span>
                <span className="text-[10px] text-[#A5B2C5]">Simulate slow ambient temperature ADC drift</span>
              </div>
            </label>
          </div>
        </div>

        {/* Data Source Config */}
        <div className="lab-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#F3F6FA] uppercase tracking-wider flex items-center gap-2 border-b border-[#29384D] pb-3">
            <RadioIcon className="w-4 h-4 text-[#35D0C1]" />
            Data Stream Communication Protocol
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#A5B2C5] mb-1.5">Active Telemetry Input</label>
              <select
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value as any)}
                className="w-full bg-[#0B1220] border border-[#29384D] rounded-lg px-3 py-2 text-sm text-[#F3F6FA] font-mono focus:outline-none focus:border-[#35D0C1]"
              >
                <option value="simulated">Biomechanical Simulator Engine (Active)</option>
                <option value="esp32_hardware">ESP32 Hardware Stream (WebSocket / Serial)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A5B2C5] mb-1.5">Sampling Frequency (Hz)</label>
              <select
                value={sampleRateHz}
                onChange={(e) => setSampleRateHz(Number(e.target.value))}
                className="w-full bg-[#0B1220] border border-[#29384D] rounded-lg px-3 py-2 text-sm text-[#F3F6FA] font-mono focus:outline-none focus:border-[#35D0C1]"
              >
                <option value={10}>10 Hz (Low Power)</option>
                <option value={20}>20 Hz (Standard Biomechanical)</option>
                <option value={50}>50 Hz (High Frequency)</option>
                <option value={100}>100 Hz (Research Grade)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hardware Channels Label Editor */}
        <div className="lab-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#F3F6FA] uppercase tracking-wider flex items-center gap-2 border-b border-[#29384D] pb-3">
            <CpuIcon className="w-4 h-4 text-[#35D0C1]" />
            Sensor Channel Labels & Enable Toggles
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {configs.map((config) => (
              <div
                key={config.id}
                className={`p-3 rounded-lg border transition-colors flex items-center justify-between space-x-3 ${
                  config.enabled ? 'bg-[#0B1220] border-[#29384D]' : 'bg-[#0B1220]/40 border-[#29384D]/50 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-2.5 flex-1">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => updateSensorConfig(config.id, { enabled: e.target.checked })}
                    className="accent-[#35D0C1] w-4 h-4 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => updateSensorConfig(config.id, { name: e.target.value })}
                    className="bg-[#141F31] border border-[#29384D] rounded px-2.5 py-1 text-xs text-[#F3F6FA] font-mono focus:outline-none focus:border-[#35D0C1] w-full"
                  />
                </div>
                <span className="text-[10px] font-mono text-[#A5B2C5] shrink-0">{config.pin}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center px-6 py-2.5 rounded-lg text-xs font-mono font-bold bg-[#35D0C1] text-[#0B1220]"
          >
            <SaveIcon className="w-4 h-4 mr-2" />
            Save Configuration Changes
          </button>
        </div>
      </form>

      <footer className="border-t border-[#29384D] pt-6 text-center">
        <nav className="flex flex-wrap justify-center gap-4 text-xs font-mono text-[#A5B2C5]">
          <NavLink to="/privacy" className="">Privacy Policy</NavLink>
          <NavLink to="/terms" className="">Terms and Conditions</NavLink>
        </nav>
        <p className="text-[10px] text-[#A5B2C5] mt-2">NeuroSense Dashboard v1.0: Local-First Sensor Telemetry Platform</p>
      </footer>
    </div>
  );
};
