/**
 * NeuroSense Precision Signal Processing & Spectral Analysis Module
 *
 * Implements moving average filtering, low-pass exponential/Butterworth smoothing,
 * statistical feature extraction, and Discrete Fourier Transform (FFT) with windowing functions.
 */

export interface SignalStats {
  mean: number;
  std: number;
  rms: number;
  min: number;
  max: number;
  peakToPeak: number;
  sampleCount: number;
  effectiveSamplingRateHz: number;
}

export interface FFTPoint {
  frequencyHz: number;
  magnitude: number;
  powerDb: number;
}

export interface FFTResult {
  spectrum: FFTPoint[];
  dominantFrequencyHz: number;
  peakMagnitude: number;
  spectralEntropy: number;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Calculates moving average of a 1D signal with configurable window size.
 */
export function applyMovingAverageFilter(data: number[], windowSize: number): number[] {
  if (!data || data.length === 0) return [];
  const w = Math.max(1, Math.min(data.length, Math.floor(windowSize)));
  if (w === 1) return [...data];

  const result: number[] = new Array(data.length);
  let sum = 0;

  for (let i = 0; i < data.length; i++) {
    sum += data[i];
    if (i >= w) {
      sum -= data[i - w];
      result[i] = sum / w;
    } else {
      result[i] = sum / (i + 1);
    }
  }
  return result;
}

/**
 * Exponential Moving Average (Low-Pass Filter) with cutoff frequency adjustment.
 */
export function applyLowPassFilter(data: number[], sampleRateHz: number, cutoffHz: number): number[] {
  if (!data || data.length === 0) return [];
  if (sampleRateHz <= 0 || cutoffHz <= 0 || cutoffHz >= sampleRateHz / 2) {
    return [...data];
  }

  const dt = 1.0 / sampleRateHz;
  const rc = 1.0 / (2 * Math.PI * cutoffHz);
  const alpha = dt / (rc + dt);

  const result: number[] = new Array(data.length);
  result[0] = data[0];

  for (let i = 1; i < data.length; i++) {
    result[i] = result[i - 1] + alpha * (data[i] - result[i - 1]);
  }
  return result;
}

/**
 * Computes descriptive statistical features of a 1D numerical array.
 */
export function calculateSignalStats(data: number[], timestampsMs: number[]): SignalStats {
  if (!data || data.length === 0) {
    return {
      mean: 0,
      std: 0,
      rms: 0,
      min: 0,
      max: 0,
      peakToPeak: 0,
      sampleCount: 0,
      effectiveSamplingRateHz: 0,
    };
  }

  const N = data.length;
  let sum = 0;
  let sumSq = 0;
  let min = data[0];
  let max = data[0];

  for (let i = 0; i < N; i++) {
    const val = data[i];
    sum += val;
    sumSq += val * val;
    if (val < min) min = val;
    if (val > max) max = val;
  }

  const mean = sum / N;
  const variance = Math.max(0, N > 1 ? data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (N - 1) : 0);
  const std = Math.sqrt(variance);
  const rms = Math.sqrt(sumSq / N);
  const peakToPeak = max - min;

  // Calculate effective sampling frequency from timestamps
  let effectiveSamplingRateHz = 0;
  if (timestampsMs && timestampsMs.length >= 2) {
    const totalDurationSec = (timestampsMs[timestampsMs.length - 1] - timestampsMs[0]) / 1000.0;
    if (totalDurationSec > 0) {
      effectiveSamplingRateHz = Number(((N - 1) / totalDurationSec).toFixed(1));
    }
  }

  return {
    mean: Number(mean.toFixed(2)),
    std: Number(std.toFixed(2)),
    rms: Number(rms.toFixed(2)),
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    peakToPeak: Number(peakToPeak.toFixed(2)),
    sampleCount: N,
    effectiveSamplingRateHz,
  };
}

export type WindowFunction = 'rectangular' | 'hanning' | 'hamming';

/**
 * Computes Discrete Fourier Transform (FFT magnitude spectrum) on a 1D signal array.
 */
export function computeFFT(
  signal: number[],
  sampleRateHz: number,
  windowType: WindowFunction = 'hanning'
): FFTResult {
  if (!signal || signal.length < 8) {
    return {
      spectrum: [],
      dominantFrequencyHz: 0,
      peakMagnitude: 0,
      spectralEntropy: 0,
      isValid: false,
      errorMessage: 'Insufficient samples for spectral analysis (minimum 8 samples required).',
    };
  }

  if (sampleRateHz <= 0) {
    return {
      spectrum: [],
      dominantFrequencyHz: 0,
      peakMagnitude: 0,
      spectralEntropy: 0,
      isValid: false,
      errorMessage: 'Invalid or zero sampling rate detected.',
    };
  }

  const N = signal.length;
  // Subtract DC mean to focus on AC oscillatory components
  const mean = signal.reduce((a, b) => a + b, 0) / N;
  const acSignal = signal.map((x) => x - mean);

  // Apply Window Function
  const windowed: number[] = new Array(N);
  for (let i = 0; i < N; i++) {
    let w = 1.0;
    if (windowType === 'hanning') {
      w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
    } else if (windowType === 'hamming') {
      w = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1));
    }
    windowed[i] = acSignal[i] * w;
  }

  // Discrete Fourier Transform (DFT) for positive frequencies k = 0 ... N/2
  const numBins = Math.floor(N / 2);
  const spectrum: FFTPoint[] = [];

  let maxMag = 0;
  let dominantFreq = 0;
  let totalPower = 0;

  for (let k = 1; k < numBins; k++) {
    let re = 0;
    let im = 0;
    const angleStep = (2 * Math.PI * k) / N;

    for (let n = 0; n < N; n++) {
      const angle = angleStep * n;
      re += windowed[n] * Math.cos(angle);
      im -= windowed[n] * Math.sin(angle);
    }

    const mag = (2 * Math.sqrt(re * re + im * im)) / N;
    const freq = (k * sampleRateHz) / N;
    const powerDb = mag > 1e-6 ? 20 * Math.log10(mag) : -120;

    totalPower += mag * mag;

    spectrum.push({
      frequencyHz: Number(freq.toFixed(2)),
      magnitude: Number(mag.toFixed(3)),
      powerDb: Number(powerDb.toFixed(1)),
    });

    if (mag > maxMag) {
      maxMag = mag;
      dominantFreq = freq;
    }
  }

  // Spectral entropy calculation
  let entropy = 0;
  if (totalPower > 0) {
    for (const pt of spectrum) {
      const p = (pt.magnitude * pt.magnitude) / totalPower;
      if (p > 1e-9) {
        entropy -= p * Math.log2(p);
      }
    }
  }

  return {
    spectrum,
    dominantFrequencyHz: Number(dominantFreq.toFixed(2)),
    peakMagnitude: Number(maxMag.toFixed(3)),
    spectralEntropy: Number(entropy.toFixed(2)),
    isValid: true,
  };
}
