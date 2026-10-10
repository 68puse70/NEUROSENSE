"""
Unit tests for NeuroSense signal processing, filtering, statistical metrics,
and Fast Fourier Transform (FFT) spectral peak detection.
"""

import math
import numpy as np
import pytest

from normalization import normalize_adc, apply_ema_filter, clamp_adc, validate_calibration_range


def compute_dft_peak(signal: list[float], sample_rate_hz: float, window: str = "hanning") -> float:
    """
    Python reference implementation of Discrete Fourier Transform peak frequency finder.
    """
    N = len(signal)
    if N < 8 or sample_rate_hz <= 0:
        return 0.0

    mean_val = sum(signal) / N
    ac_signal = [x - mean_val for x in signal]

    # Apply windowing
    windowed = []
    for i in range(N):
        if window == "hanning":
            w = 0.5 * (1.0 - math.cos((2.0 * math.pi * i) / (N - 1)))
        elif window == "hamming":
            w = 0.54 - 0.46 * math.cos((2.0 * math.pi * i) / (N - 1))
        else:
            w = 1.0
        windowed.append(ac_signal[i] * w)

    num_bins = N // 2
    max_mag = 0.0
    dominant_freq = 0.0

    for k in range(1, num_bins):
        re = 0.0
        im = 0.0
        angle_step = (2.0 * math.pi * k) / N
        for n in range(N):
            angle = angle_step * n
            re += windowed[n] * math.cos(angle)
            im -= windowed[n] * math.sin(angle)

        mag = (2.0 * math.sqrt(re * re + im * im)) / N
        freq = (k * sample_rate_hz) / N

        if mag > max_mag:
            max_mag = mag
            dominant_freq = freq

    return round(dominant_freq, 1)


def test_known_frequency_sine_wave_fft():
    """Verify that a 5.0 Hz pure sine wave sampled at 50 Hz yields an FFT peak of 5.0 Hz."""
    fs = 50.0
    N = 100  # 2 seconds of data
    t = [i / fs for i in range(N)]
    target_freq = 5.0

    # 5.0 Hz sine wave
    signal = [math.sin(2 * math.pi * target_freq * ti) for ti in t]

    peak_freq = compute_dft_peak(signal, fs, window="hanning")
    assert abs(peak_freq - target_freq) <= 0.5, f"Expected peak near {target_freq} Hz, got {peak_freq} Hz"


def test_constant_dc_signal():
    """Verify constant signal returns 0 Hz AC peak."""
    fs = 50.0
    signal = [2000.0] * 50
    peak_freq = compute_dft_peak(signal, fs, window="hanning")
    assert peak_freq == 0.0


def test_noisy_signal_processing():
    """Verify signal filtering reduces variance in noisy signals."""
    np.random.seed(42)
    clean = np.sin(np.linspace(0, 4 * np.pi, 100))
    noise = np.random.normal(0, 0.5, 100)
    noisy = clean + noise

    filtered = []
    prev = noisy[0]
    for val in noisy:
        prev = apply_ema_filter(val, prev, alpha=0.2)
        filtered.append(prev)

    assert np.var(filtered) < np.var(noisy), "Filtered signal variance should be less than noisy signal variance"


def test_edge_cases():
    """Test insufficient samples and invalid input handling."""
    assert compute_dft_peak([1.0, 2.0], 50.0) == 0.0
    assert compute_dft_peak([1.0] * 20, 0.0) == 0.0
