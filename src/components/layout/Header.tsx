import React, { useState, useEffect } from 'react';
import { useSensor } from '../../context/SensorContext';

const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const PauseIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const DiscIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="4"></circle>
  </svg>
);

const SlidersIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const DatabaseIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const RadioIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="4" fill="currentColor"></circle>
  </svg>
);

const RefreshCwIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"></polyline>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

export const Header: React.FC = () => {
  const {
    streamStatus,
    toggleStream,
    sampleRateHz,
    setSampleRateHz,
    isRecording,
    startRecording,
    stopRecording,
    exportSessionCSV,
    dataSource,
    latestFrame,
    isBackendConnected,
    backendStatusText,
    wsConnectionState,
    wsReconnectAttempt,
  } = useSensor();

  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [showRecModal, setShowRecModal] = useState(false);
  const [recTitle, setRecTitle] = useState('');
  const [recDesc, setRecDesc] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let interval: number | null = null;
    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const handleStartRecordingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recTitle.trim()) {
      setErrorMsg('Please enter a session title before recording.');
      return;
    }
    setErrorMsg('');
    startRecording(recTitle.trim(), recDesc.trim());
    setShowRecModal(false);
    setRecTitle('');
    setRecDesc('');
  };

  const activeSensorsCount = latestFrame
    ? Object.keys(latestFrame.readings).length
    : 0;

  return (
    <header className="sticky top-0 z-30 bg-[#101A2B]/95 backdrop-blur-md border-b border-[#29384D] px-4 lg:px-8 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left Status & Source Info */}
        <div className="flex flex-wrap items-center gap-2 pl-10 lg:pl-0">
          {/* Live Telemetry Pill */}
          <div className="flex items-center space-x-2 bg-[#141F31] px-3 py-1.5 rounded-lg border border-[#29384D]">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                streamStatus === 'streaming'
                  ? 'bg-[#35D0C1]'
                  : streamStatus === 'stale'
                  ? 'bg-[#F4B860]'
                  : 'bg-[#F07178]'
              }`}
            />
            <span className="text-xs font-mono font-medium text-[#F3F6FA] uppercase tracking-wide">
              {streamStatus === 'streaming'
                ? 'Live Telemetry'
                : streamStatus === 'stale'
                ? 'Stale Stream (>1.5s)'
                : 'Stream Paused'}
            </span>
            <span className="text-xs text-[#A5B2C5] font-mono border-l border-[#29384D] pl-2">
              {activeSensorsCount} Channels
            </span>
          </div>

          {/* WebSocket Transport Connection Pill */}
          <div
            className={`hidden sm:flex items-center space-x-1.5 text-xs font-mono px-2.5 py-1 rounded border ${
              wsConnectionState === 'connected'
                ? 'bg-[#35D0C1]/10 text-[#35D0C1] border-[#35D0C1]/30'
                : wsConnectionState === 'reconnecting'
                ? 'bg-[#F4B860]/10 text-[#F4B860] border-[#F4B860]/30'
                : 'bg-[#0B1220]/60 text-[#A5B2C5] border-[#29384D]'
            }`}
          >
            {wsConnectionState === 'connected' && <RadioIcon className="w-3.5 h-3.5 text-[#35D0C1]" />}
            {wsConnectionState === 'reconnecting' && <RefreshCwIcon className="w-3.5 h-3.5 text-[#F4B860]" />}
            {wsConnectionState === 'disconnected' && <AlertTriangleIcon className="w-3.5 h-3.5 text-[#A5B2C5]" />}
            <span>
              {wsConnectionState === 'connected'
                ? 'WS STREAM CONNECTED'
                : wsConnectionState === 'reconnecting'
                ? `WS RECONNECTING (#${wsReconnectAttempt})...`
                : 'WS DISCONNECTED'}
            </span>
          </div>

          {/* Backend SQLite Connectivity Badge */}
          <div
            className={`hidden xl:flex items-center space-x-1.5 text-[10px] font-mono px-2.5 py-1 rounded border ${
              isBackendConnected
                ? 'bg-[#43C98B]/10 text-[#43C98B] border-[#43C98B]/30'
                : 'bg-[#F4B860]/10 text-[#F4B860] border-[#F4B860]/30'
            }`}
          >
            <DatabaseIcon className="w-3 h-3" />
            <span>{backendStatusText}</span>
          </div>
        </div>

        {/* Right Controls Bar */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Frequency Dropdown */}
          <div className="flex items-center bg-[#141F31] rounded-lg border border-[#29384D] px-2 py-1 text-xs">
            <SlidersIcon className="w-3.5 h-3.5 text-[#35D0C1] mr-1.5" />
            <select
              value={sampleRateHz}
              onChange={(e) => setSampleRateHz(Number(e.target.value))}
              className="bg-transparent text-[#F3F6FA] font-mono focus:outline-none cursor-pointer"
            >
              <option value={10} className="bg-[#141F31] text-[#F3F6FA]">10 Hz</option>
              <option value={20} className="bg-[#141F31] text-[#F3F6FA]">20 Hz</option>
              <option value={50} className="bg-[#141F31] text-[#F3F6FA]">50 Hz</option>
              <option value={100} className="bg-[#141F31] text-[#F3F6FA]">100 Hz</option>
            </select>
          </div>

          {/* Pause / Play Toggle */}
          <button
            onClick={toggleStream}
            className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-medium font-mono border ${
              streamStatus === 'streaming'
                ? 'bg-[#1B2A40] text-[#F4B860] border-[#F4B860]/40'
                : 'bg-[#35D0C1]/10 text-[#35D0C1] border-[#35D0C1]/40'
            }`}
          >
            {streamStatus === 'streaming' ? (
              <>
                <PauseIcon className="w-3.5 h-3.5 mr-1.5" />
                Pause
              </>
            ) : (
              <>
                <PlayIcon className="w-3.5 h-3.5 mr-1.5" />
                Resume
              </>
            )}
          </button>

          {/* Recording Button */}
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="flex items-center px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#F07178]/20 text-[#F07178] border border-[#F07178]/50"
            >
              <DiscIcon className="w-3.5 h-3.5 mr-1.5 text-[#F07178]" />
              REC ({recordingSeconds}s): Stop & Save
            </button>
          ) : (
            <button
              onClick={() => {
                setShowRecModal(true);
                setErrorMsg('');
              }}
              className="flex items-center px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium bg-[#141F31] text-[#F3F6FA] border border-[#29384D]"
            >
              <DiscIcon className="w-3.5 h-3.5 mr-1.5 text-[#F07178]" />
              Start Recording
            </button>
          )}

          {/* Export CSV Shortcut */}
          <button
            onClick={() => exportSessionCSV()}
            className="hidden md:flex items-center px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-[#1B2A40] text-[#F3F6FA] border border-[#29384D]"
          >
            <DownloadIcon className="w-3.5 h-3.5 mr-1.5 text-[#35D0C1]" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Start Recording Modal */}
      {showRecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#141F31] border border-[#29384D] rounded-xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowRecModal(false)}
              className="absolute top-4 right-4 p-1 rounded text-[#A5B2C5]"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#F3F6FA] flex items-center gap-2 mb-1">
              <DiscIcon className="w-5 h-5 text-[#F07178]" />
              Start Telemetry Session Recording
            </h3>
            <p className="text-xs text-[#A5B2C5] mb-4">
              Recording live WebSocket telemetry frames directly to SQLite database.
            </p>

            {errorMsg && (
              <div className="mb-3 p-2.5 rounded bg-[#F07178]/20 border border-[#F07178]/50 text-xs font-mono text-[#F07178] flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleStartRecordingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#A5B2C5] mb-1">Session Title *</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g., Isometric Pinch Trial #4"
                  value={recTitle}
                  onChange={(e) => setRecTitle(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#29384D] rounded-lg px-3 py-2 text-sm text-[#F3F6FA] font-mono focus:outline-none focus:border-[#35D0C1]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#A5B2C5] mb-1">Trial Notes / Setup</label>
                <textarea
                  rows={3}
                  placeholder="Optional trial notes..."
                  value={recDesc}
                  onChange={(e) => setRecDesc(e.target.value)}
                  className="w-full bg-[#0B1220] border border-[#29384D] rounded-lg px-3 py-2 text-sm text-[#F3F6FA] font-mono focus:outline-none focus:border-[#35D0C1]"
                />
              </div>

              <div className="p-3 bg-[#0B1220] rounded-lg border border-[#29384D] text-[11px] font-mono text-[#A5B2C5] flex justify-between">
                <span>Transport Stream: <strong className="text-[#35D0C1]">{wsConnectionState.toUpperCase()}</strong></span>
                <span>Persistence: <strong className="text-[#43C98B]">{isBackendConnected ? 'FastAPI SQLite' : 'Local'}</strong></span>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-mono bg-[#1B2A40] text-[#A5B2C5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-mono font-bold bg-[#35D0C1] text-[#0B1220] shadow-lg shadow-[#35D0C1]/20"
                >
                  Begin Telemetry Recording
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
