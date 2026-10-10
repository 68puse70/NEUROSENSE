import React from 'react';
import { MetricsOverview } from '../components/dashboard/MetricsOverview';
import { HandVisualization } from '../components/dashboard/HandVisualization';
import { LiveTelemetryChart } from '../components/dashboard/LiveTelemetryChart';
import { SensorCardGrid } from '../components/dashboard/SensorCardGrid';
import { EventLog } from '../components/dashboard/EventLog';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner / System Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#141F31] p-5 rounded-xl border border-[#29384D]">
        <div>
          <h2 className="text-xl font-bold text-[#F3F6FA] tracking-tight">
            NeuroSense Master Dashboard
          </h2>
          <p className="text-xs text-[#A5B2C5] mt-1">
            Real-time biometric force & flexion telemetry platform for ESP32 hardware prototype.
          </p>
        </div>
        <div className="mt-3 md:mt-0 flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-[#0B1220] border border-[#29384D] text-[#35D0C1]">
            Mode: <strong className="text-[#F3F6FA]">Biomechanical Simulator</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#0B1220] border border-[#29384D] text-[#43C98B]">
            Status: <strong className="text-[#43C98B]">STREAMING ONLINE</strong>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <MetricsOverview />

      {/* Middle Grid: Hand Diagram + Live Telemetry Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <HandVisualization />
        </div>
        <div className="lg:col-span-7">
          <LiveTelemetryChart />
        </div>
      </div>

      {/* Bottom Grid: Telemetry Cards + Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <SensorCardGrid />
        </div>
        <div className="lg:col-span-4">
          <EventLog />
        </div>
      </div>
    </div>
  );
};
