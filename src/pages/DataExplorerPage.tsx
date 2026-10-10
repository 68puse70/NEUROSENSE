import React, { useState, useMemo } from 'react';
import { useSensor } from '../context/SensorContext';
import { SensorConfig, SessionRecord, TelemetryFrame, SensorReading } from '../types/sensor';

const DatabaseIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

interface DataRow {
  frameIdx: number;
  timestamp: number;
  formattedTime: string;
  channelId: string;
  rawAdc: number;
  filteredValue: number;
  normalizedPercent: number;
  status: string;
  accelMag: number;
  gyroMag: number;
}

export const DataExplorerPage: React.FC = () => {
  const { historyBuffer, savedSessions, configs, exportSessionCSV } = useSensor();

  const [selectedSessionId, setSelectedSessionId] = useState<string>('live');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Flatten telemetry frames into sample-level data rows
  const allRows = useMemo(() => {
    let frames = historyBuffer;
    if (selectedSessionId !== 'live') {
      const sess = savedSessions.find((s: SessionRecord) => s.id === selectedSessionId);
      if (sess && sess.dataFrames) {
        frames = sess.dataFrames;
      }
    }

    const rows: DataRow[] = [];
    frames.forEach((frame: TelemetryFrame, frameIdx: number) => {
      Object.values(frame.readings).forEach((reading: SensorReading) => {
        if (selectedChannelId !== 'all' && reading.id !== selectedChannelId) return;

        rows.push({
          frameIdx,
          timestamp: frame.timestamp,
          formattedTime: frame.formattedTime || new Date(frame.timestamp).toLocaleTimeString(),
          channelId: reading.id,
          rawAdc: reading.rawAdc,
          filteredValue: reading.filteredValue,
          normalizedPercent: reading.normalizedPercent,
          status: reading.status,
          accelMag: frame.imu ? frame.imu.accelMag : 1.0,
          gyroMag: frame.imu ? frame.imu.gyroMag : 0.0,
        });
      });
    });

    let filtered = rows;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = rows.filter(
        (r) =>
          r.formattedTime.toLowerCase().includes(q) ||
          r.channelId.toLowerCase().includes(q) ||
          r.rawAdc.toString().includes(q) ||
          r.frameIdx.toString().includes(q)
      );
    }

    if (sortOrder === 'asc') {
      return filtered.sort((a, b) => a.timestamp - b.timestamp);
    } else {
      return filtered.sort((a, b) => b.timestamp - a.timestamp);
    }
  }, [historyBuffer, savedSessions, selectedSessionId, selectedChannelId, searchQuery, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(allRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allRows.slice(start, start + pageSize);
  }, [allRows, currentPage, pageSize]);

  // Export CSV handler
  const handleExportFiltered = () => {
    if (selectedSessionId !== 'live') {
      const sess = savedSessions.find((s: SessionRecord) => s.id === selectedSessionId);
      if (sess) exportSessionCSV(sess);
      return;
    }

    // Export live buffer rows as CSV
    const headers = ['FrameIndex', 'TimestampMs', 'FormattedTime', 'ChannelId', 'RawADC', 'FilteredValue', 'NormalizedPct', 'Status', 'AccelMag', 'GyroMag'];
    const csvLines = [headers.join(',')];
    allRows.forEach((r) => {
      csvLines.push([r.frameIdx, r.timestamp, r.formattedTime, r.channelId, r.rawAdc, r.filteredValue, r.normalizedPercent, r.status, r.accelMag, r.gyroMag].join(','));
    });
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurosense_live_data_explorer.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F3F6FA] flex items-center gap-2">
            <DatabaseIcon className="text-[#35D0C1] w-6 h-6" />
            Telemetry Data Explorer
          </h1>
          <p className="text-sm text-[#A5B2C5] mt-1">
            Sample-level tabular telemetry browser with search, channel filtering, and CSV export.
          </p>
        </div>

        <button
          onClick={handleExportFiltered}
          className="px-4 py-2 rounded-lg bg-[#35D0C1] hover:bg-[#35D0C1]/90 text-[#0B1220] font-bold text-xs font-mono flex items-center gap-2 shadow-lg"
        >
          <DownloadIcon className="w-4 h-4" />
          Export Dataset (CSV)
        </button>
      </div>

      {/* Control & Filter Bar */}
      <div className="p-4 rounded-xl bg-[#141F31] border border-[#29384D] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Session Filter */}
        <div>
          <label className="block text-[10px] font-mono text-[#A5B2C5] uppercase mb-1">Session Source</label>
          <select
            value={selectedSessionId}
            onChange={(e) => { setSelectedSessionId(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 rounded-lg bg-[#1B2A40] text-[#F3F6FA] border border-[#29384D] text-xs font-mono"
          >
            <option value="live">[Live] Buffer ({historyBuffer.length} frames)</option>
            {savedSessions.map((s: SessionRecord) => (
              <option key={s.id} value={s.id}>
                [Session] {s.title} ({s.sampleCount} pts)
              </option>
            ))}
          </select>
        </div>

        {/* Channel Filter */}
        <div>
          <label className="block text-[10px] font-mono text-[#A5B2C5] uppercase mb-1">Channel Filter</label>
          <select
            value={selectedChannelId}
            onChange={(e) => { setSelectedChannelId(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 rounded-lg bg-[#1B2A40] text-[#F3F6FA] border border-[#29384D] text-xs font-mono"
          >
            <option value="all">All Channels (Combined)</option>
            {configs.map((cfg: SensorConfig) => (
              <option key={cfg.id} value={cfg.id}>
                {cfg.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div>
          <label className="block text-[10px] font-mono text-[#A5B2C5] uppercase mb-1">Search Samples</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search time, channel, ADC..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#1B2A40] text-[#F3F6FA] border border-[#29384D] text-xs font-mono outline-none focus:border-[#35D0C1]"
            />
            <SearchIcon className="w-3.5 h-3.5 text-[#A5B2C5] absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-[10px] font-mono text-[#A5B2C5] uppercase mb-1">Sort Order</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="w-full px-3 py-2 rounded-lg bg-[#1B2A40] text-[#F3F6FA] border border-[#29384D] text-xs font-mono"
          >
            <option value="desc">Newest First (Descending)</option>
            <option value="asc">Oldest First (Ascending)</option>
          </select>
        </div>

        {/* Page Size */}
        <div>
          <label className="block text-[10px] font-mono text-[#A5B2C5] uppercase mb-1">Rows Per Page</label>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="w-full px-3 py-2 rounded-lg bg-[#1B2A40] text-[#F3F6FA] border border-[#29384D] text-xs font-mono"
          >
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
            <option value={500}>500 rows</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl bg-[#141F31] border border-[#29384D] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#101A2B] border-b border-[#29384D] text-[11px] font-mono text-[#A5B2C5] uppercase">
                <th className="py-3 px-4">Frame #</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Channel ID</th>
                <th className="py-3 px-4">Raw ADC</th>
                <th className="py-3 px-4">Filtered ADC</th>
                <th className="py-3 px-4">Normalized %</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">IMU Accel Mag</th>
                <th className="py-3 px-4">IMU Gyro Mag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#29384D]/60 text-xs font-mono">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#A5B2C5]">
                    No matching sample records found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => (
                  <tr key={`${row.frameIdx}-${row.channelId}-${idx}`} className="hover:bg-[#1B2A40]/50 transition-colors">
                    <td className="py-2.5 px-4 text-[#A5B2C5]">#{row.frameIdx}</td>
                    <td className="py-2.5 px-4 text-[#F3F6FA]">{row.formattedTime}</td>
                    <td className="py-2.5 px-4 text-[#35D0C1] font-bold">{row.channelId}</td>
                    <td className="py-2.5 px-4 text-[#F3F6FA]">{row.rawAdc}</td>
                    <td className="py-2.5 px-4 text-[#43C98B]">{row.filteredValue}</td>
                    <td className="py-2.5 px-4 text-[#38BDF8]">{row.normalizedPercent}%</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.status === 'normal'
                            ? 'bg-[#43C98B]/10 text-[#43C98B]'
                            : row.status === 'warning'
                            ? 'bg-[#F4B860]/10 text-[#F4B860]'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {row.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[#A5B2C5]">{row.accelMag} g</td>
                    <td className="py-2.5 px-4 text-[#A5B2C5]">{row.gyroMag} °/s</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-[#101A2B] border-t border-[#29384D] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#A5B2C5]">
          <div>
            Showing samples {allRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, allRows.length)} of {allRows.length} total
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded bg-[#1B2A40] disabled:opacity-40 text-[#F3F6FA] border border-[#29384D]"
            >
              Previous
            </button>
            <span>
              Page <strong className="text-[#35D0C1]">{currentPage}</strong> of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded bg-[#1B2A40] disabled:opacity-40 text-[#F3F6FA] border border-[#29384D]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExplorerPage;
