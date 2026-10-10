import React, { useState, useEffect } from 'react';
import { useSensor } from '../../context/SensorContext';

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

const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const InfoIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

interface LogItem {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success';
  message: string;
}

export const EventLog: React.FC = () => {
  const { latestFrame, streamStatus, dataSource, isRecording } = useSensor();
  const [logs, setLogs] = useState<LogItem[]>([
    {
      id: 'init_1',
      timestamp: new Date().toTimeString().split(' ')[0],
      type: 'info',
      message: 'NeuroSense Telemetry Engine initialized in Simulator mode.',
    },
    {
      id: 'init_2',
      timestamp: new Date().toTimeString().split(' ')[0],
      type: 'success',
      message: '6 sensor channels active (1 FSR tactile + 5 Flex joint).',
    },
  ]);

  // Log stream status changes & peaks
  useEffect(() => {
    if (!latestFrame) return;

    // Check for high pressure peaks > 85%
    Object.values(latestFrame.readings).forEach((r) => {
      if (r.normalizedPercent > 92 && Math.random() < 0.1) {
        setLogs((prev) => [
          {
            id: `log_${Date.now()}_${r.id}`,
            timestamp: latestFrame.formattedTime,
            type: 'warning',
            message: `High load saturation detected on ${r.name} (${r.normalizedPercent}% - ${r.rawAdc} ADC)`,
          },
          ...prev.slice(0, 40),
        ]);
      }
    });
  }, [latestFrame]);

  useEffect(() => {
    setLogs((prev) => [
      {
        id: `status_${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        type: 'info',
        message: `Stream status changed to: ${streamStatus.toUpperCase()} (${dataSource.toUpperCase()})`,
      },
      ...prev.slice(0, 40),
    ]);
  }, [streamStatus, dataSource]);

  useEffect(() => {
    if (isRecording) {
      setLogs((prev) => [
        {
          id: `rec_${Date.now()}`,
          timestamp: new Date().toTimeString().split(' ')[0],
          type: 'success',
          message: 'Started recording live telemetry session.',
        },
        ...prev.slice(0, 40),
      ]);
    }
  }, [isRecording]);

  return (
    <div className="lab-card p-5 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-[#29384D] pb-3 mb-3">
        <h3 className="text-sm font-bold text-[#F3F6FA] uppercase tracking-wider flex items-center gap-2">
          <CpuIcon className="w-4 h-4 text-[#35D0C1]" />
          Diagnostic Console Log
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B1220] text-[#A5B2C5] border border-[#29384D]">
          {logs.length} Events
        </span>
      </div>

      <div className="flex-1 bg-[#0B1220] rounded-xl p-3 border border-[#29384D] font-mono text-xs overflow-y-auto max-h-60 space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start space-x-2 border-b border-[#29384D]/40 pb-1.5 last:border-0">
            <span className="text-[#A5B2C5]/70 shrink-0 text-[10px] pt-0.5">{log.timestamp}</span>
            <span className="shrink-0 pt-0.5">
              {log.type === 'warning' && <AlertTriangleIcon className="w-3.5 h-3.5 text-[#F4B860]" />}
              {log.type === 'success' && <CheckCircleIcon className="w-3.5 h-3.5 text-[#43C98B]" />}
              {log.type === 'info' && <InfoIcon className="w-3.5 h-3.5 text-[#35D0C1]" />}
            </span>
            <span
              className={`leading-tight ${
                log.type === 'warning'
                  ? 'text-[#F4B860]'
                  : log.type === 'success'
                  ? 'text-[#43C98B]'
                  : 'text-[#F3F6FA]'
              }`}
            >
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventLog;
