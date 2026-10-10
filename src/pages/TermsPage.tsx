import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="border-b border-[#29384D] pb-6">
        <h1 className="text-2xl font-bold text-[#F3F6FA] tracking-tight">Terms and Conditions</h1>
        <p className="text-xs font-mono text-[#A5B2C5] mt-2">Last updated: October 10, 2026</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">1. Acceptance of Terms</h2>
        <p className="text-sm text-[#A5B2C5]">
          By accessing or using the NeuroSense Dashboard ("Application"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree, do not use the Application.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">2. Nature of the Application</h2>
        <p className="text-sm text-[#A5B2C5]">
          NeuroSense Dashboard is a local-first, open-source sensor telemetry and diagnostics platform for ESP32-based hardware prototypes. It provides real-time visualization, recording, calibration, and session review for force-sensitive resistor (FSR) and flex sensor data.
        </p>
        <p className="text-sm text-[#A5B2C5]">
          The Application is a prototype engineering tool. It is not a medical device, not FDA-cleared, and not intended for clinical diagnosis, patient monitoring, or safety-critical applications.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">3. No Warranty</h2>
        <p className="text-sm text-[#A5B2C5]">
          THE APPLICATION IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, RELIABILITY, OR NON-INFRINGEMENT.
        </p>
        <p className="text-sm text-[#A5B2C5]">
          Sensor readings are raw ADC values mapped to normalized percentages via user-defined calibration. These values do not represent validated physical units (Newtons, PSI, degrees) without traceable reference calibration.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">4. Limitation of Liability</h2>
        <p className="text-sm text-[#A5B2C5]">
          IN NO EVENT SHALL THE DEVELOPERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM USE OR INABILITY TO USE THE APPLICATION, INCLUDING DATA LOSS, HARDWARE DAMAGE, OR INCORRECT READINGS.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">5. User Responsibilities</h2>
        <ul className="space-y-2 text-sm text-[#A5B2C5] list-disc pl-5">
          <li>Validate sensor calibration against known references before relying on data</li>
          <li>Ensure hardware connections are safe and within electrical specifications</li>
          <li>Back up session data regularly (export CSV, copy <code className="font-mono text-[#35D0C1] bg-[#0B1220] px-1 rounded">neurosense.db</code>)</li>
          <li>Use only for lawful, non-harmful purposes</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">6. Data and Privacy</h2>
        <p className="text-sm text-[#A5B2C5]">
          All data remains on your local device. No data is transmitted to external servers. See the <a href="/privacy" className="text-[#35D0C1] underline hover:text-[#43C98B]">Privacy Policy</a> for details.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">7. Intellectual Property</h2>
        <p className="text-sm text-[#A5B2C5]">
          The Application source code is proprietary to the NeuroSense project. You may not copy, modify, distribute, or create derivative works without explicit permission, except as permitted by applicable open-source licenses for included dependencies.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">8. Third-Party Dependencies</h2>
        <p className="text-sm text-[#A5B2C5]">
          The Application includes third-party libraries (React, Tailwind CSS, Recharts, Lucide React, FastAPI, etc.) each governed by their own licenses. See <code className="font-mono text-[#35D0C1] bg-[#0B1220] px-1 rounded">package.json</code> and <code className="font-mono text-[#35D0C1] bg-[#0B1220] px-1 rounded">backend/requirements.txt</code> for details.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">9. Modifications and Availability</h2>
        <p className="text-sm text-[#A5B2C5]">
          The developers may modify, suspend, or discontinue the Application at any time without notice. No obligation exists to provide updates, support, or backward compatibility.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">10. Governing Law</h2>
        <p className="text-sm text-[#A5B2C5]">
          These Terms are governed by the laws of the jurisdiction where the development entity is established, without regard to conflict-of-law principles.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">11. Severability</h2>
        <p className="text-sm text-[#A5B2C5]">
          If any provision is held unenforceable, the remaining provisions continue in full effect.
        </p>
      </section>

      <section className="space-y-4 border-t border-[#29384D] pt-6">
        <h2 className="text-lg font-semibold text-[#F3F6FA]">12. Contact</h2>
        <p className="text-sm text-[#A5B2C5]">
          For questions about these Terms, refer to the project repository or contact the development team.
        </p>
      </section>
    </div>
  );
};