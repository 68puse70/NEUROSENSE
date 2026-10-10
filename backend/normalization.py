"""
NeuroSense — Normalization Module (v1.0)

Explicit, testable functions that convert raw 12-bit ADC readings into
calibrated normalized percentages.

IMPORTANT DISCLAIMER:
  Normalized values represent the sensor's output mapped to a calibrated ADC
  range.  They do NOT represent validated pressure (Newtons, PSI) or bend-angle
  (degrees) measurements.  Such physical-unit conversions require sensor-
  specific, traceable calibration against a reference instrument.

Formulas
--------
1.  **Linear ADC Normalization**

        percent = clamp( (filtered - minAdc) / (maxAdc - minAdc) × 100, 0, 100 )

    where:
        - `filtered`  = EMA-smoothed ADC value
        - `minAdc`    = zero-force / zero-flex calibration point
        - `maxAdc`    = full-scale calibration point
        - `clamp(v, lo, hi)` = max(lo, min(hi, v))

2.  **EMA Low-Pass Filter**

        filtered[n] = α × raw + (1 - α) × filtered[n-1]

    Default α = 0.25 (4-sample smoothing window at 20 Hz → ~200 ms rise time).

Edge-case handling
------------------
- minAdc == maxAdc  → normalizedPercent = 0 (division guarded)
- minAdc >  maxAdc  → treated as invalid; normalizedPercent = 0
- raw < 0 or > 4095 → clamped to [0, 4095] before filtering
- filtered is None   → raw value used in place of filtered

"""

import math
from typing import Optional

# ESP32 12-bit ADC constants
ADC_MIN = 0
ADC_MAX = 4095


def clamp(value: float, lo: float, hi: float) -> float:
    """Constrain *value* to the closed interval [lo, hi]."""
    return max(lo, min(hi, value))


def clamp_adc(raw: int) -> int:
    """Clamp a raw ADC reading to the 12-bit range [0, 4095]."""
    return int(clamp(raw, ADC_MIN, ADC_MAX))


def validate_calibration_range(min_adc: int, max_adc: int) -> tuple[bool, str]:
    """
    Validate a calibration range.

    Returns (is_valid, error_message).
    Valid means min_adc < max_adc and both are in [0, 4095].
    """
    if min_adc < ADC_MIN or min_adc > ADC_MAX:
        return False, f"min_adc ({min_adc}) is outside the valid 12-bit range [{ADC_MIN}, {ADC_MAX}]."
    if max_adc < ADC_MIN or max_adc > ADC_MAX:
        return False, f"max_adc ({max_adc}) is outside the valid 12-bit range [{ADC_MIN}, {ADC_MAX}]."
    if min_adc >= max_adc:
        return False, f"min_adc ({min_adc}) must be strictly less than max_adc ({max_adc})."
    return True, ""


def normalize_adc(
    filtered_value: int,
    min_adc: int,
    max_adc: int,
) -> int:
    """
    Convert a filtered ADC value to a normalised percentage [0, 100].

    If the calibration range is invalid (min_adc >= max_adc), returns 0.
    Out-of-range filtered values are clamped.
    """
    if min_adc >= max_adc:
        return 0
    span = max_adc - min_adc  # guaranteed > 0
    ratio = (filtered_value - min_adc) / span
    return int(clamp(ratio * 100, 0, 100))


def apply_ema_filter(
    raw_adc: int,
    prev_filtered: Optional[int],
    alpha: float = 0.25,
) -> int:
    """
    Exponential-moving-average low-pass filter.

    Parameters
    ----------
    raw_adc : int
        Current raw 12-bit ADC reading.
    prev_filtered : int or None
        Previous filtered value.  If None, the raw value is used directly
        (first sample bootstrapping).
    alpha : float
        Smoothing factor in (0, 1].  Larger → faster response, less smoothing.
    """
    raw_clamped = clamp_adc(raw_adc)
    if prev_filtered is None:
        return raw_clamped
    val = alpha * raw_clamped + (1 - alpha) * prev_filtered
    return int(math.floor(val + 0.5))
