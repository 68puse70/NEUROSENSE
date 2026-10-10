import React from 'react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="border-b border-[#29384D] pb-6">
        <h1 className="text-2xl font-bold text-[#F3F6FA] tracking-tight">Privacy Policy</h1>
        <p className="text-xs font-mono text-[#A5B2C5] mt-2">Last updated: October 10, 2026</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">1. Data Controller</h2>
        <p className="text-sm text-[#A5B2C5]">
          NeuroSense Dashboard is a local-first sensor telemetry application. No third party operates as a data controller. All data remains on your device.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">2. Information We Process</h2>
        <ul className="space-y-2 text-sm text-[#A5B2C5] list-disc pl-5">
          <li><strong className="text-[#F3F6FA]">Sensor telemetry data:</strong> Raw ADC readings, filtered values, and normalized percentages from connected FSR and flex sensors. Stored locally in SQLite database.</li>
          <li><strong className="text-[#F3F6FA]">Session metadata:</strong> Session title, description, timestamps, duration, sample count, and data source (simulated or hardware).</li>
          <li><strong className="text-[#F3F6FA]">Calibration settings:</strong> Per-sensor min/max ADC bounds, zero offsets, version, and source. Stored locally.</li>
          <li><strong className="text-[#F3F6FA]">Application preferences:</strong> Sampling rate, display labels, simulator parameters, WebSocket endpoint. Stored in browser memory (reset on reload).</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">3. Data We Do Not Collect</h2>
        <ul className="space-y-2 text-sm text-[#A5B2C5] list-disc pl-5">
          <li>No personal identifiers (name, email, IP address)</li>
          <li>No analytics, telemetry, or usage tracking</li>
          <li>No cookies, localStorage, or IndexedDB beyond SQLite via backend</li>
          <li>No cloud synchronization or remote storage</li>
          <li>No third-party scripts, fonts, or CDN requests (Inter font loaded via Google Fonts preconnect; can be replaced with system fonts)</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">4. Local Storage & Persistence</h2>
        <p className="text-sm text-[#A5B2C5]">
          All sensor readings, sessions, and calibration data are persisted in a local SQLite database via the FastAPI backend running on your machine. The database file (<code className="font-mono text-[#35D0C1] bg-[#0B1220] px-1 rounded">neurosense.db</code>) resides in the project directory. You have full control: delete the file to erase all data.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">5. Network Communication</h2>
        <p className="text-sm text-[#A5B2C5]">
          The dashboard communicates with the local backend via WebSocket (<code className="font-mono text-[#35D0C1] bg-[#0B1220] px-1 rounded">ws://localhost:8000/ws/telemetry</code> by default) and REST API (<code className="font-mono text-[#35D0C1] bg-[#0B1220] px-1 rounded">http://localhost:8000</code>). No external network requests are made. In hardware mode, the ESP32 device connects to the same local network; no internet access is required.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">6. Data Retention</h2>
        <p className="text-sm text-[#A5B2C5]">
          Data persists until you delete it. Sessions can be deleted individually from the Sessions page. Deleting the <code className="font-mono text-[#35D0C1] bg-[#0B1220] px-1 rounded">neurosense.db</code> file removes all historical data. Calibration settings persist in the database until reset.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">7. Your Rights</h2>
        <p className="text-sm text-[#A5B2C5]">
          Since all data is local, you have complete control: access, export (CSV), modify, or delete any data at any time through the application interface or by direct database manipulation.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">8. Children's Privacy</h2>
        <p className="text-sm text-[#A5B2C5]">
          This application is not directed at children under 13. No personal information is collected from any user.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">9. Changes to This Policy</h2>
        <p className="text-sm text-[#A5B2C5]">
          Updates will be posted here with a revised date. Continued use after changes constitutes acceptance.
        </p>
      </section>

      <section className="space-y-4 border-t border-[#29384D] pt-6">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">10. Contact</h2>
        <p className="text-sm text-[#A5B2C5]">
          For questions about this policy or data practices, refer to the project repository or contact the development team.
        </p>
      </section>
    </div>
  );
};