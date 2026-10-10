import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SensorProvider } from './context/SensorContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './pages/DashboardPage';
import { LiveMonitorPage } from './pages/LiveMonitorPage';
import { SessionsPage } from './pages/SessionsPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { DataExplorerPage } from './pages/DataExplorerPage';
import { CalibrationPage } from './pages/CalibrationPage';
import { SettingsPage } from './pages/SettingsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';

export const App: React.FC = () => {
  return (
    <SensorProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#0B1220] text-[#F3F6FA] flex flex-col lg:flex-row antialiased">
          {/* Persistent Sidebar */}
          <Sidebar />

          {/* Main Application Container */}
          <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
            <Header />

            <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/monitor" element={<LiveMonitorPage />} />
                <Route path="/analysis" element={<AnalysisPage />} />
                <Route path="/data" element={<DataExplorerPage />} />
                <Route path="/sessions" element={<SessionsPage />} />
                <Route path="/calibration" element={<CalibrationPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </SensorProvider>
  );
};

export default App;
