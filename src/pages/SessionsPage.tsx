import React, { useState } from 'react';
import { useSensor } from '../context/SensorContext';
import { SessionRecord } from '../types/sensor';
const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const PauseIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

type Icons = {
  [key: string]: React.ReactElement;
};

const Icon = ({ name, size = 14, color = '#35D0C1' }: { name: string; size?: number; color?: string }) => {
  const icons: Icons = {
    history: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    ),
    play: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    ),
    pause: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </svg>
    ),
    download: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    ),
    trash2: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18M6 6l12 12"></path>
      </svg>
    ),
    clock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    ),
    calendar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"></rect>
        <line x1="16" y1="2" x2="16" y2="10"></line>
        <line x1="8" y1="2" x2="8" y2="10"></line>
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    ),
    database: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
      </svg>
    ),
    filetext: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 1-2-2H4a2 2 0 0 1-2 2v14a2 2 0 0 1-2 2h2a2 2 0 0 1 2 2h4a2 2 0 0 1 2 2h2a2 2 0 0 1 2 2v-1"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <polygon points="16 13 20 13 20 17 16 13"></polygon>
      </svg>
    ),
    barchart2: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <rect x="6" y="3" width="3" height="13"></rect>
        <rect x="10" y="3" width="3" height="13"></rect>
        <rect x="14" y="3" width="3" height="13"></rect>
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
    checkcircle2: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    ),
    refreshcw: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
      </svg>
    ),
  };

  const IconComponent = icons[name];
  return IconComponent ?? null;
};

export const SessionsPage: React.FC = () => {
  const { savedSessions, deleteSession, exportSessionCSV, configs, loadSessionDetail, isBackendConnected } = useSensor();

  const [activeSession, setActiveSession] = useState<SessionRecord | null>(
    savedSessions[0] || null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [scrubberTime, setScrubberTime] = useState<number>(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const filteredSessions = savedSessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectSession = async (session: SessionRecord) => {
    setIsLoadingDetail(true);
    setScrubberTime(0);
    setIsPlaying(false);
    const detail = await loadSessionDetail(session.id);
    setActiveSession(detail || session);
    setIsLoadingDetail(false);
  };

  const handleConfirmDelete = (id: string) => {
    deleteSession(id);
    setDeleteConfirmId(null);
    if (activeSession?.id === id) {
      setActiveSession(savedSessions.find((s) => s.id !== id) || null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141F31] p-5 rounded-xl border border-[#29384D]">
        <div>
          <h2 className="text-xl font-bold text-[#F3F6FA] uppercase tracking-wider flex items-center gap-2">
            <Icon name="history" size={5} color="#35D0C1" />
            Telemetry Session Database & Playback
          </h2>
          <p className="text-xs text-[#A5B2C5] mt-0.5">
            Persistent SQLite trial recordings, peak channel metrics, and historical waveform playback
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-[#0B1220] text-[#35D0C1] border border-[#29384D]">
            {savedSessions.length} Sessions Stored
          </span>
          <span
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono ${
              isBackendConnected
                ? 'bg-[#43C98B]/10 text-[#43C98B] border-[#43C98B]/30'
                : 'bg-[#F4B860]/10 text-[#F4B860] border-[#F4B860]/30'
            }`}
          >
            {isBackendConnected ? 'SQLite Active' : 'In-Memory Mode'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sessions List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-[#F3F6FA] uppercase tracking-wider flex items-center gap-2">
              <Icon name="database" size={4} color="#35D0C1" />
              Session Library
            </h3>
            {/* Search Input */}
            <div className="relative w-44">
              <Icon name="search" size={3.5} color="#A5B2C5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0B1220] border border-[#29384D] rounded-lg pl-8 pr-2 py-1 text-xs font-mono text-[#F3F6FA] focus:outline-none focus:border-[#35D0C1]"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {filteredSessions.map((session) => {
              const isSelected = activeSession?.id === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={`p-4 rounded-xl border cursor-pointer ${
                    isSelected
                      ? 'bg-[#1B2A40] border-[#35D0C1]'
                      : 'bg-[#141F31] border-[#29384D]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-[#F3F6FA]">{session.title}</h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0B1220] text-[#35D0C1] border border-[#29384D]">
                          {session.source?.toUpperCase() ?? 'SIMULATED'}
                        </span>
                      </div>
                      <p className="text-xs text-[#A5B2C5] mt-1 line-clamp-2">{session.description}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(session.id);
                      }}
                      className="p-1.5 rounded text-[#A5B2C5]"
                      title="Delete session"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#29384D] flex items-center justify-between text-[11px] font-mono text-[#A5B2C5]">
                    <span className="flex items-center gap-1">
                      <Icon name="calendar" size={3} color="#35D0C1" />
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="clock" size={3} color="#43C98B" />
                      {session.durationSeconds}s ({session.sampleCount} frames)
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredSessions.length === 0 && (
              <div className="lab-card p-8 text-center text-xs font-mono text-[#A5B2C5]">
                No sessions found matching search criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right Session Detail & Scrubber */}
        <div className="lg:col-span-7">
          {isLoadingDetail ? (
            <div className="lab-card p-12 text-center text-xs font-mono text-[#35D0C1] flex flex-col items-center justify-center space-y-2">
              <Icon name="refreshcw" size={24} />
              <span>Fetching session readings from SQLite database...</span>
            </div>
          ) : activeSession ? (
            <div className="lab-card p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#29384D] pb-3 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-[#F3F6FA]">{activeSession.title}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1B2A40] text-[#43C98B]">
                      {activeSession.source?.toUpperCase() ?? 'SIMULATED'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#A5B2C5]">
                    UTC Created: {new Date(activeSession.createdAt).toUTCString()} | Rate: {activeSession.sampleRateHz ?? 20} Hz
                  </span>
                </div>
                <button
                  onClick={() => exportSessionCSV(activeSession)}
                  className="flex items-center px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#35D0C1] text-[#0B1220] hover:bg-[#43C98B] transition-colors self-start sm:self-auto"
                >
                  <DownloadIcon className="w-3.5 h-3.5 mr-1.5" />
                  Download CSV
                </button>
              </div>

              {activeSession.description && (
                <div className="bg-[#0B1220] p-3 rounded-lg border border-[#29384D] text-xs text-[#A5B2C5] flex items-start space-x-2">
                  <Icon name="filetext" size={4} color="#35D0C1" />
                  <div>
                    <span className="font-mono text-[#F3F6FA] font-bold block mb-0.5">Session Description / Notes</span>
                    {activeSession.description}
                  </div>
                </div>
              )}

              {/* Timeline Scrubber */}
              <div className="bg-[#0B1220] p-4 rounded-xl border border-[#29384D] space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-[#A5B2C5]">
                  <span className="flex items-center gap-1.5">
                    <Icon name="barchart2" size={4} color="#35D0C1" />
                    Timeline Playback Scrubber
                  </span>
                  <span className="text-[#35D0C1] font-bold">
                    {scrubberTime}s / {activeSession.durationSeconds}s
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={activeSession.durationSeconds || 10}
                  value={scrubberTime}
                  onChange={(e) => setScrubberTime(Number(e.target.value))}
                  className="w-full accent-[#35D0C1] bg-[#141F31] cursor-pointer"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2.5 rounded-lg bg-[#35D0C1] text-[#0B1220]"
                    >
                      {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4 fill-current" />}
                    </button>
                    <span className="text-xs font-mono text-[#F3F6FA]">
                      {isPlaying ? 'Playback Running...' : 'Playback Paused'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs font-mono">
                    <span className="text-[#A5B2C5]">Speed:</span>
                    {[0.5, 1, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`px-2 py-0.5 rounded border ${
                          playbackSpeed === speed
                            ? 'bg-[#35D0C1] text-[#0B1220] font-bold border-[#35D0C1]'
                            : 'bg-[#141F31] text-[#A5B2C5] border-[#29384D]'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Peak Sensor Load Summary Grid */}
              <div>
                <h4 className="text-xs font-mono text-[#A5B2C5] uppercase mb-2 flex items-center gap-1.5">
                  <Icon name="flame" size={3.5} color="#F4B860" /> Peak Channel Loads Recorded
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {configs.map((c) => {
                    const peak = activeSession.peakLoads?.[c.id] ?? 0;
                    return (
                      <div
                        key={c.id}
                        className="p-2 bg-[#0B1220] rounded-lg border border-[#29384D] flex items-center justify-between text-xs font-mono"
                      >
                        <span className="text-[#A5B2C5] truncate max-w-[90px]">{c.name}</span>
                        <strong className="text-[#35D0C1]">{peak}%</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="lab-card p-12 text-center text-xs font-mono text-[#A5B2C5]">
              Select a session on the left to inspect telemetry.
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-[#141F31] border border-[#29384D] rounded-xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-[#F3F6FA] flex items-center gap-2">
              <TrashIcon className="w-4 h-4 text-[#F07178]" />
              Confirm Session Deletion
            </h3>
            <p className="text-xs text-[#A5B2C5]">
              Are you sure you want to permanently delete this session from SQLite database?
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg text-xs font-mono bg-[#1B2A40] text-[#A5B2C5]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-[#F07178] text-[#0B1220]"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
