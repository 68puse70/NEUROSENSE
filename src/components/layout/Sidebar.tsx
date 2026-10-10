import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSensor } from '../../context/SensorContext';

const MenuIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const LayoutDashboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"></rect>
    <rect x="14" y="3" width="7" height="7" rx="1"></rect>
    <rect x="3" y="14" width="7" height="7" rx="1"></rect>
    <rect x="14" y="14" width="7" height="7" rx="1"></rect>
  </svg>
);

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const HistoryIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
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

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const CpuIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
  </svg>
);

const ZapIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { streamStatus, dataSource, setDataSource, systemMetrics } = useSensor();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboardIcon },
    { name: 'Live Monitor', path: '/monitor', icon: ActivityIcon },
    { name: 'Signal Analysis', path: '/analysis', icon: ZapIcon },
    { name: 'Data Explorer', path: '/data', icon: CpuIcon },
    { name: 'Sessions / History', path: '/sessions', icon: HistoryIcon },
    { name: 'Calibration', path: '/calibration', icon: SlidersIcon },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-lg bg-[#141F31] text-[#F3F6FA] border border-[#29384D] shadow-lg"
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-[#101A2B] border-r border-[#29384D] flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#29384D]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#1B2A40] border border-[#35D0C1]/40 flex items-center justify-center">
              <ZapIcon className="text-[#35D0C1]" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wider text-[#F3F6FA] flex items-center gap-1.5">
                NEUROSENSE
              </h1>
              <p className="text-xs font-mono text-[#A5B2C5] tracking-tight">
                PRECISION LAB v1.0
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono tracking-widest text-[#A5B2C5] uppercase">
            Main Interface
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg font-medium text-sm ${
                    isActive
                      ? 'bg-[#1B2A40] text-[#35D0C1] border border-[#35D0C1]/30 font-semibold'
                      : 'text-[#A5B2C5]'
                  }`
                }
              >
                <Icon className="w-4 h-4 mr-3 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Connection & Hardware Status Card */}
        <div className="p-3 border-t border-[#29384D] bg-[#0B1220]/50">
          <div className="p-3 rounded-lg bg-[#141F31] border border-[#29384D]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-[#A5B2C5] flex items-center gap-1.5">
                <RadioIcon className="w-3.5 h-3.5 text-[#35D0C1]" />
                DATA SOURCE
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#35D0C1]/10 text-[#35D0C1] border border-[#35D0C1]/30">
                {dataSource === 'simulated' ? 'SIMULATED' : 'ESP32 HARDWARE'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A5B2C5] flex items-center gap-1.5">
                <CpuIcon className="w-3.5 h-3.5 text-[#43C98B]" />
                MCU Telemetry
              </span>
              <span className="font-mono text-[#43C98B] flex items-center gap-1">
                {streamStatus === 'streaming' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#43C98B]" />
                    <CheckCircleIcon className="w-3.5 h-3.5 text-[#43C98B]" />
                    ACTIVE
                  </>
                ) : (
                  <>
                    <AlertTriangleIcon className="w-3.5 h-3.5 text-[#F4B860]" />
                    PAUSED
                  </>
                )}
              </span>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#29384D] flex justify-between text-[11px] text-[#A5B2C5] font-mono">
              <span>Freq: <strong className="text-[#F3F6FA]">{systemMetrics.sampleRateHz} Hz</strong></span>
              <span>Buffer: <strong className="text-[#F3F6FA]">{systemMetrics.bufferSize} pts</strong></span>
            </div>

            {/* Source Switcher Button */}
            <button
              onClick={() => setDataSource(dataSource === 'simulated' ? 'esp32_hardware' : 'simulated')}
              className="w-full mt-2.5 py-1.5 px-2 rounded text-[11px] font-mono font-medium text-center bg-[#1B2A40] text-[#A5B2C5] border border-[#29384D]"
            >
              Switch to {dataSource === 'simulated' ? 'ESP32 Hardware' : 'Simulator Mode'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
