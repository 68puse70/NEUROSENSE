import React, { useState, useEffect } from 'react';
import { useSensor } from '../context/SensorContext';

type Icons = {
  [key: string]: React.ReactElement;
};

const Icon = ({ name, size = 14, color = '#35D0C1' }: { name: string; size?: number; color?: string }) => {
  const icons: Icons = {
    sliders: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    ),
    rotateccw: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 9 12 15 21"></polyline>
      </svg>
    ),
    checkcircle2: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    ),
    target: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    ),
    zap: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    ),
    sparkles: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="12 2 15 8 21 8"></polyline>
        <polyline points="12 2 9 8 3 8"></polyline>
        <polyline points="12 22 15 16 21 16"></polyline>
        <polyline points="12 22 9 16 3 16"></polyline>
      </svg>
    ),
    alertcircle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    ),
    history: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    ),
    info: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="10" y1="11" x2="14" y2="11"></line>
        <line x1="10" y1="8" x2="14" y2="8"></line>
      </svg>
    ),
    shieldcheck: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4l10 6-10 6v-4"></path>
        <circle cx="12" cy="18" r="2"></circle>
      </svg>
    ),
    shieldalert: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ),
    activity: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>
    ),
    layers: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="21" r="1.5"></circle>
        <circle cx="15.5" cy="21" r="1.5"></circle>
      </svg>
    ),
  };

  const IconComponent = icons[name];
  return IconComponent ?? null;
};

export const CalibrationPage: React.FC = () => {
  const {
    configs,
    latestFrame,
    applyTare,
    applyMaxReference,
    applyGuidedCalibration,
    resetSensorToFactory,
    resetAllToFactory,
    getCalibrationHistory,
    isBackendConnected,
  } = useSensor();

  const [selectedSensorId, setSelectedSensorId] = useState<string>('fsr_thumb');
  const [step, setStep] = useState<number>(1);
  const [inputMin, setInputMin] = useState<number>(120);
  const [inputMax, setInputMax] = useState<number>(3950);
  const [inputNotes, setInputNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Calibration history modal
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  const activeSensor = configs.find((c) => c.id === selectedSensorId);
  const activeReading = latestFrame?.readings[selectedSensorId];

  // Sync inputs when active sensor changes
  useEffect(() => {
    const target = configs.find((c) => c.id === selectedSensorId);
    if (target) {
      setInputMin(target.calibration.minAdc);
      setInputMax(target.calibration.maxAdc);
    }
    setValidationError('');
  }, [selectedSensorId, configs]);

  // Real-time live range validation
  const checkRangeValidation = (min: number, max: number): { isValid: boolean; message: string } => {
    if (min < 0 || min > 4095) {
      return { isValid: false, message: `Zero Min ADC (${min}) is outside valid 12-bit range [0, 4095].` };
    }
    if (max < 0 || max > 4095) {
      return { isValid: false, message: `Full-Scale Max ADC (${max}) is outside valid 12-bit range [0, 4095].` };
    }
    if (min >= max) {
      return { isValid: false, message: `Zero Min ADC (${min}) must be strictly less than Full-Scale Max ADC (${max}).` };
    }
    return { isValid: true, message: 'Valid 12-bit calibration range.' };
  };

  const currentValidation = checkRangeValidation(inputMin, inputMax);

  const handleSelectSensor = (id: string) => {
    setSelectedSensorId(id);
    const target = configs.find((c) => c.id === id);
    if (target) {
      setInputMin(target.calibration.minAdc);
      setInputMax(target.calibration.maxAdc);
    }
    setValidationError('');
  };

  const handleCaptureZeroBaseline = async () => {
    if (!activeReading) return;
    const currentAdc = activeReading.rawAdc;
    applyTare(selectedSensorId);
    setInputMin(currentAdc);
    setSuccessToast(`Captured ${currentAdc} ADC as zero baseline for ${activeSensor?.name}`);
    setTimeout(() => setSuccessToast(''), 3500);
    setStep(2);
  };

  const handleCaptureMaxLoad = async () => {
    if (!activeReading) return;
    const currentAdc = activeReading.rawAdc;
    applyMaxReference(selectedSensorId);
    setInputMax(currentAdc);
    setSuccessToast(`Captured ${currentAdc} ADC as max reference for ${activeSensor?.name}`);
    setTimeout(() => setSuccessToast(''), 3500);
    setStep(3);
  };

  const handleSaveGuidedCalibration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentValidation.isValid) {
      setValidationError(currentValidation.message);
      return;
    }
    setValidationError('');
    setIsSaving(true);

    try {
      const ok = await applyGuidedCalibration(
        selectedSensorId,
        inputMin,
        inputMax,
        inputMin, // zeroOffset
        'guided',
        inputNotes
      );

      if (ok) {
        setSuccessToast(
          `Successfully saved calibration for ${activeSensor?.name} (v${(activeSensor?.calibration.version || 1) + 1}): [${inputMin} - ${inputMax}] ADC`
        );
        setTimeout(() => setSuccessToast(''), 4000);
        setStep(3);
      } else {
        setValidationError('Failed to save calibration parameters to backend.');
      }
    } catch (err: any) {
      setValidationError(err.message || 'Error updating calibration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSingle = async (sensorId: string) => {
    await resetSensorToFactory(sensorId);
    setSuccessToast(`Reset ${configs.find((c) => c.id === sensorId)?.name} to factory calibration.`);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const handleResetAll = async () => {
    await resetAllToFactory();
    setSuccessToast('Reset all channels to default factory calibration profiles.');
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const handleOpenHistory = async (sensorId: string) => {
    setSelectedSensorId(sensorId);
    setHistoryModalOpen(true);
    setIsLoadingHistory(true);
    const logs = await getCalibrationHistory(sensorId);
    setHistoryLogs(logs);
    setIsLoadingHistory(false);
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="bg-[#141F31] border border-[#29384D] rounded-xl p-4 flex items-start gap-3 text-xs text-[#A5B2C5]">
        <Icon name="info" size={5} color="#35D0C1" />
        <div>
          <strong className="text-[#F3F6FA] font-mono uppercase tracking-wider block mb-0.5">
            Calibration & Normalization Disclaimer
          </strong>
          Normalized percentage values represent raw 12-bit ADC readings mapped linearly onto configured upper and lower bounds.
          They <span className="text-[#F4B860] font-semibold">do NOT represent validated physical units</span> (such as Newtons, PSI, or bend angles in degrees) without sensor-specific, traceable reference calibration.
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141F31] p-5 rounded-xl border border-[#29384D]">
        <div>
          <h2 className="text-xl font-bold text-[#F3F6FA] uppercase tracking-wider flex items-center gap-2">
            <Icon name="sliders" size={5} color="#35D0C1" />
            Sensor Calibration & Tare Studio
          </h2>
          <p className="text-xs text-[#A5B2C5] mt-0.5">
            Guided baseline tare capture, full-scale reference calibration, range validation, and audit history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenHistory(selectedSensorId)}
            className="flex items-center px-3.5 py-2 rounded-lg text-xs font-mono bg-[#1B2A40] text-[#35D0C1] border border-[#29384D]"
          >
            <Icon name="history" size={3.5} />
            Calibration History
          </button>
          <button
            onClick={handleResetAll}
            className="flex items-center px-3.5 py-2 rounded-lg text-xs font-mono bg-[#1B2A40] text-[#A5B2C5] border border-[#29384D]"
          >
            <Icon name="rotateccw" size={3.5} />
            Reset All Factory Defaults
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {successToast && (
        <div className="bg-[#43C98B]/20 border border-[#43C98B] p-3.5 rounded-xl flex items-center justify-between text-xs font-mono text-[#43C98B]">
          <span className="flex items-center gap-2">
            <Icon name="checkcircle2" size={4} color="#43C98B" shrink-0 />
            {successToast}
          </span>
          <span className="text-[10px] text-[#A5B2C5]">Updated & Saved</span>
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div className="bg-[#F07178]/20 border border-[#F07178] p-3.5 rounded-xl flex items-center gap-2 text-xs font-mono text-[#F07178]">
<span className="flex items-center gap-2">
            <Icon name="alertcircle" size={4} color="#F07178" />
            {validationError}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Guided Wizard */}
        <div className="lg:col-span-6 lab-card p-5 space-y-5">
          <div className="border-b border-[#29384D] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F3F6FA] flex items-center gap-2">
                <Icon name="target" size={4} color="#35D0C1" />
                Guided Calibration Studio
              </h3>
              <p className="text-xs text-[#A5B2C5]">Select a channel and complete the 3-step capture workflow</p>
            </div>
            {activeSensor && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1B2A40] text-[#35D0C1] border border-[#29384D]">
                v{activeSensor.calibration.version} ({activeSensor.calibration.source})
              </span>
            )}
          </div>

          {/* Channel Selector */}
          <div>
            <label className="block text-xs font-mono text-[#A5B2C5] mb-1.5">Selected Sensor Channel</label>
            <select
              value={selectedSensorId}
              onChange={(e) => handleSelectSensor(e.target.value)}
              className="w-full bg-[#0B1220] border border-[#29384D] rounded-lg px-3 py-2 text-sm text-[#F3F6FA] font-mono focus:outline-none focus:border-[#35D0C1]"
            >
              {configs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type.toUpperCase()}: {c.pin}) v{c.calibration.version} [{c.calibration.minAdc}-{c.calibration.maxAdc}]
                </option>
              ))}
            </select>
          </div>

          {/* Steps Navigation Bar */}
<div className="flex items-center justify-between bg-[#0B1220] p-1.5 rounded-lg border border-[#29384D] text-xs font-mono">
            <button
              onClick={() => setStep(1)}
              className={`flex-1 py-1.5 rounded text-center ${
                step === 1 ? 'bg-[#35D0C1] text-[#0B1220] font-bold' : 'text-[#A5B2C5]'
              }`}
            >
              1. Zero Tare
            </button>
            <button
              onClick={() => setStep(2)}
              className={`flex-1 py-1.5 rounded text-center ${
                step === 2 ? 'bg-[#35D0C1] text-[#0B1220] font-bold' : 'text-[#A5B2C5]'}
              `}
            >
              2. Max Reference
            </button>
            <button
              onClick={() => setStep(3)}
              className={`flex-1 py-1.5 rounded text-center ${
                step === 3 ? 'bg-[#35D0C1] text-[#0B1220] font-bold' : 'text-[#A5B2C5]'}
              `}
            >
              3. Verification
            </button>
          </div>

          {/* Live Streaming Monitor Panel */}
          <div className="bg-[#0B1220] p-3.5 rounded-xl border border-[#29384D] space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-[#A5B2C5] border-b border-[#29384D]/60 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Icon name="activity" size={3.5} color="#35D0C1" />
                Live Telemetry Feed: <strong className="text-[#F3F6FA]">{activeSensor?.name}</strong>
              </span>
              <span className="text-[10px] text-[#43C98B]">20 Hz Live</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-[#141F31] p-2 rounded border border-[#29384D]">
                <div className="text-[10px] text-[#A5B2C5]">Raw ADC</div>
                <div className="text-base font-bold text-[#35D0C1]">{activeReading?.rawAdc ?? 0}</div>
              </div>
              <div className="bg-[#141F31] p-2 rounded border border-[#29384D]">
                <div className="text-[10px] text-[#A5B2C5]">EMA Filtered</div>
                <div className="text-base font-bold text-[#F4B860]">{activeReading?.filteredAdc ?? activeReading?.rawAdc ?? 0}</div>
              </div>
              <div className="bg-[#141F31] p-2 rounded border border-[#29384D]">
                <div className="text-[10px] text-[#A5B2C5]">Normalized</div>
                <div className="text-base font-bold text-[#43C98B]">{activeReading?.normalizedPercent ?? 0}%</div>
              </div>
            </div>
          </div>

          {/* Step 1: Zero Tare */}
          {step === 1 && (
            <div className="space-y-4 bg-[#0B1220] p-4 rounded-xl border border-[#29384D]">
              <h4 className="text-sm font-bold text-[#F3F6FA] flex items-center gap-1.5">
                <Icon name="zap" size={4} color="#35D0C1" /> Step 1: Capture Zero Baseline
              </h4>
              <p className="text-xs text-[#A5B2C5]">
                Leave <strong className="text-[#F3F6FA]">{activeSensor?.name}</strong> completely unpressed and at rest.
              </p>

              <button
                onClick={handleCaptureZeroBaseline}
                className="w-full py-2.5 rounded-lg text-xs font-mono font-bold bg-[#35D0C1] text-[#0B1220] hover:bg-[#43C98B] transition-colors"
              >
                Capture Current Reading as Zero Baseline
              </button>
            </div>
          )}

          {/* Step 2: Max Reference */}
          {step === 2 && (
            <div className="space-y-4 bg-[#0B1220] p-4 rounded-xl border border-[#29384D]">
              <h4 className="text-sm font-bold text-[#F3F6FA] flex items-center gap-1.5">
                <Icon name="target" size={4} color="#F4B860" /> Step 2: Capture Max Load Reference
              </h4>
              <p className="text-xs text-[#A5B2C5]">
                Apply maximum target grip pressure or full 90° flex to <strong className="text-[#F3F6FA]">{activeSensor?.name}</strong>.
              </p>

              <button
                onClick={handleCaptureMaxLoad}
                className="w-full py-2.5 rounded-lg text-xs font-mono font-bold bg-[#F4B860] text-[#0B1220] hover:bg-[#F4B860]/80 transition-colors"
              >
                Capture Current Reading as Max Reference
              </button>
            </div>
          )}

          {/* Step 3: Verification & Range Fine-Tuning */}
          {step === 3 && (
            <form onSubmit={handleSaveGuidedCalibration} className="space-y-4 bg-[#0B1220] p-4 rounded-xl border border-[#29384D]">
              <h4 className="text-sm font-bold text-[#F3F6FA] flex items-center gap-1.5">
                <Icon name="sparkles" size={4} color="#43C98B" /> Step 3: Real-Time Dynamic Test & Save
              </h4>

              {/* Dynamic Normalized Visualizer */}
              <div className="bg-[#141F31] p-4 rounded-lg border border-[#29384D] text-center space-y-2">
                <div className="text-xs font-mono text-[#A5B2C5]">LIVE CALIBRATED LOAD</div>
                <div className="text-4xl font-mono font-bold text-[#35D0C1]">
                  {activeReading?.normalizedPercent ?? 0}%
                </div>
                <div className="w-full bg-[#1B2A40] h-3 rounded-full overflow-hidden border border-[#29384D]">
                  <div
                    className="h-full bg-gradient-to-r from-[#35D0C1] to-[#43C98B] transition-all duration-150"
                    style={{ width: `${activeReading?.normalizedPercent ?? 0}%` }}
                  />
                </div>
              </div>

              {/* Range Bounds Adjustment */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-mono text-[#A5B2C5] mb-1">Zero Min ADC Limit</label>
                  <input
                    type="number"
                    min={0}
                    max={4095}
                    value={inputMin}
                    onChange={(e) => setInputMin(Number(e.target.value))}
                    className="w-full bg-[#141F31] border border-[#29384D] rounded p-2 text-xs font-mono text-[#F3F6FA] focus:border-[#35D0C1]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#A5B2C5] mb-1">Full-Scale Max ADC Limit</label>
                  <input
                    type="number"
                    min={0}
                    max={4095}
                    value={inputMax}
                    onChange={(e) => setInputMax(Number(e.target.value))}
                    className="w-full bg-[#141F31] border border-[#29384D] rounded p-2 text-xs font-mono text-[#F3F6FA] focus:border-[#35D0C1]"
                  />
                </div>
              </div>

              {/* Real-time Range Validation Status Badge */}
              <div className="flex items-center gap-2 font-mono text-xs p-2.5 rounded bg-[#141F31] border border-[#29384D]">
                {currentValidation.isValid ? (
                  <>
                    <Icon name="shieldcheck" size={4} color="#43C98B" shrink-0 />
                    <span className="text-[#43C98B] text-[11px]">{currentValidation.message}</span>
                  </>
                ) : (
                  <>
                    <Icon name="shieldalert" size={4} color="#F07178" shrink-0 />
                    <span className="text-[#F07178] text-[11px]">{currentValidation.message}</span>
                  </>
                )}
              </div>

              {/* Calibration Notes */}
              <div>
                <label className="block text-[10px] font-mono text-[#A5B2C5] mb-1">Calibration Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Calibrated with 500g reference weight"
                  value={inputNotes}
                  onChange={(e) => setInputNotes(e.target.value)}
                  className="w-full bg-[#141F31] border border-[#29384D] rounded p-2 text-xs font-mono text-[#F3F6FA] focus:border-[#35D0C1]"
                />
              </div>

              <button
                type="submit"
                disabled={!currentValidation.isValid || isSaving}
                className={`w-full py-2.5 rounded-lg text-xs font-mono font-bold ${
                  currentValidation.isValid && !isSaving
                    ? 'bg-[#35D0C1] text-[#0B1220]'
                    : 'bg-[#1B2A40] text-[#A5B2C5] cursor-not-allowed'
                }`}
              >
                {isSaving ? 'Saving Calibration...' : 'Save Guided Calibration & Bump Version'}
              </button>
            </form>
          )}
        </div>

        {/* Right Channel Calibration Matrix */}
        <div className="lg:col-span-6 lab-card p-5 space-y-4">
          <div className="border-b border-[#29384D] pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F3F6FA] uppercase tracking-wider">
                Calibration Matrix & Version Map
              </h3>
              <p className="text-xs text-[#A5B2C5]">Configured zero-offsets, reference bounds, and calibration sources</p>
            </div>
            <span className="text-[10px] font-mono text-[#A5B2C5] bg-[#141F31] px-2 py-1 rounded border border-[#29384D]">
              {isBackendConnected ? 'FastAPI DB Persisted' : 'Local State'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#29384D] text-[#A5B2C5] uppercase text-[10px]">
                  <th className="py-2.5 px-2">Channel Name</th>
                  <th className="py-2.5 px-2">Min ADC</th>
                  <th className="py-2.5 px-2">Max ADC</th>
                  <th className="py-2.5 px-2">Ver / Source</th>
                  <th className="py-2.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#29384D]/40">
                {configs.map((c) => {
                  const isSelected = selectedSensorId === c.id;
                  return (
                    <tr key={c.id} className={`${isSelected ? 'bg-[#1B2A40]/70' : ''}`}>
                      <td className="py-2.5 px-2 font-semibold text-[#F3F6FA]">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                          <span className="truncate max-w-[110px]">{c.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-[#35D0C1]">{c.calibration.minAdc}</td>
                      <td className="py-2.5 px-2 text-[#F4B860]">{c.calibration.maxAdc}</td>
                      <td className="py-2.5 px-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#35D0C1]/15 text-[#35D0C1]">
                          v{c.calibration.version} ({c.calibration.source})
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSelectSensor(c.id)}
                            className="px-2 py-0.5 rounded text-[10px] font-mono border border-[#29384D] bg-[#0B1220] text-[#35D0C1]"
                          >
                            Calibrate
                          </button>
                          <button
                            onClick={() => handleResetSingle(c.id)}
                            title="Reset channel to factory settings"
                            className="p-1 rounded text-[10px] font-mono border border-[#29384D] bg-[#0B1220] text-[#A5B2C5]"
                          >
                            <Icon name="rotateccw" size={3} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Calibration History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B1220]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141F31] border border-[#29384D] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-[#29384D] pb-3">
              <h3 className="text-base font-bold text-[#F3F6FA] flex items-center gap-2 font-mono">
                <Icon name="history" size={5} color="#35D0C1" />
                Calibration Audit Trail: <span className="text-[#35D0C1]">{activeSensor?.name}</span>
              </h3>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="text-[#A5B2C5] hover:text-[#F3F6FA] font-mono text-sm"
              >
                ✕
              </button>
            </div>

            {isLoadingHistory ? (
              <div className="py-8 text-center text-xs font-mono text-[#A5B2C5]">Loading calibration history...</div>
            ) : historyLogs.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-[#A5B2C5]">
                No historical calibration records found for this channel.
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
                {historyLogs.map((log: any, idx: number) => (
                  <div key={log.id || idx} className="bg-[#0B1220] p-3 rounded-xl border border-[#29384D] flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#35D0C1]">Version {log.version}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1B2A40] text-[#A5B2C5]">
                          Source: {log.source}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#A5B2C5] mt-1">
                        Range: <strong className="text-[#F3F6FA]">{log.minAdc} - {log.maxAdc} ADC</strong> | Zero Offset: {log.zeroOffset ?? 'N/A'}
                      </div>
                      {log.notes && <div className="text-[10px] text-[#A5B2C5]/80 italic mt-0.5">"{log.notes}"</div>}
                    </div>
                    <div className="text-right text-[10px] text-[#A5B2C5]">
                      {log.calibratedAt ? new Date(log.calibratedAt).toLocaleString() : 'Recent'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="px-4 py-2 bg-[#1B2A40] text-[#F3F6FA] border border-[#29384D] rounded-lg text-xs font-mono hover:bg-[#29384D]"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
