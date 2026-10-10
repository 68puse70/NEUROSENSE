"""
NeuroSense Phase 5 — Tests for normalization, calibration validation,
CRUD persistence, and edge-case handling.

Run with: python -m pytest tests/ -v
"""
import json
import os
import sys
import pytest

# Make backend importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from normalization import (
    clamp,
    clamp_adc,
    validate_calibration_range,
    normalize_adc,
    apply_ema_filter,
)


# ──────────────────────────────────────────────────────────────
#  Normalization — clamp / clamp_adc
# ──────────────────────────────────────────────────────────────

class TestClamp:
    def test_within_range(self):
        assert clamp(50, 0, 100) == 50

    def test_below_min(self):
        assert clamp(-10, 0, 100) == 0

    def test_above_max(self):
        assert clamp(200, 0, 100) == 100

    def test_at_boundaries(self):
        assert clamp(0, 0, 100) == 0
        assert clamp(100, 0, 100) == 100


class TestClampAdc:
    def test_normal_value(self):
        assert clamp_adc(2048) == 2048

    def test_negative(self):
        assert clamp_adc(-50) == 0

    def test_above_4095(self):
        assert clamp_adc(5000) == 4095

    def test_at_bounds(self):
        assert clamp_adc(0) == 0
        assert clamp_adc(4095) == 4095


# ──────────────────────────────────────────────────────────────
#  Calibration range validation
# ──────────────────────────────────────────────────────────────

class TestValidateCalibrationRange:
    def test_valid_range(self):
        ok, err = validate_calibration_range(100, 3900)
        assert ok is True
        assert err == ""

    def test_equal_endpoints(self):
        ok, err = validate_calibration_range(2000, 2000)
        assert ok is False
        assert "strictly less than" in err

    def test_reversed_endpoints(self):
        ok, err = validate_calibration_range(3000, 1000)
        assert ok is False
        assert "strictly less than" in err

    def test_min_below_zero(self):
        ok, err = validate_calibration_range(-1, 3000)
        assert ok is False
        assert "outside the valid" in err

    def test_max_above_4095(self):
        ok, err = validate_calibration_range(100, 4096)
        assert ok is False
        assert "outside the valid" in err

    def test_min_equals_zero_valid(self):
        ok, err = validate_calibration_range(0, 4095)
        assert ok is True

    def test_single_step_range(self):
        ok, err = validate_calibration_range(2000, 2001)
        assert ok is True


# ──────────────────────────────────────────────────────────────
#  ADC normalization
# ──────────────────────────────────────────────────────────────

class TestNormalizeAdc:
    def test_midpoint(self):
        # midpoint of [0, 4000] = 2000 → 50%
        assert normalize_adc(2000, 0, 4000) == 50

    def test_at_min(self):
        assert normalize_adc(120, 120, 3950) == 0

    def test_at_max(self):
        assert normalize_adc(3950, 120, 3950) == 100

    def test_below_min_clamped(self):
        assert normalize_adc(50, 120, 3950) == 0

    def test_above_max_clamped(self):
        assert normalize_adc(4095, 120, 3950) == 100

    def test_equal_endpoints_returns_zero(self):
        """Division-by-zero guard: equal endpoints → 0%."""
        assert normalize_adc(2000, 2000, 2000) == 0

    def test_reversed_endpoints_returns_zero(self):
        """Reversed calibration → 0%."""
        assert normalize_adc(2000, 3000, 1000) == 0

    def test_quarter_point(self):
        # 25% of [1000, 3000] = 1500
        assert normalize_adc(1500, 1000, 3000) == 25

    def test_three_quarter_point(self):
        # 75% of [1000, 3000] = 2500
        assert normalize_adc(2500, 1000, 3000) == 75

    def test_zero_range_adc(self):
        assert normalize_adc(0, 0, 0) == 0

    def test_near_max_boundary(self):
        # 99.x% of [0, 100]  → rounding to int
        result = normalize_adc(99, 0, 100)
        assert result == 99

    def test_full_12bit_range(self):
        assert normalize_adc(0, 0, 4095) == 0
        assert normalize_adc(4095, 0, 4095) == 100
        assert normalize_adc(2047, 0, 4095) == 49  # truncation


# ──────────────────────────────────────────────────────────────
#  EMA filter
# ──────────────────────────────────────────────────────────────

class TestEmaFilter:
    def test_first_sample_passthrough(self):
        """When prev_filtered is None, raw value is returned directly."""
        assert apply_ema_filter(2000, None) == 2000

    def test_smooth_step(self):
        # α=0.25: filtered = 0.25 * 2000 + 0.75 * 1000 = 1250
        assert apply_ema_filter(2000, 1000, alpha=0.25) == 1250

    def test_stable_input(self):
        # Same input as previous → no change
        assert apply_ema_filter(1000, 1000) == 1000

    def test_clamps_negative_raw(self):
        result = apply_ema_filter(-100, 500)
        # -100 clamped to 0 → 0.25 * 0 + 0.75 * 500 = 375
        assert result == 375

    def test_clamps_above_4095(self):
        result = apply_ema_filter(5000, 2000)
        # 5000 clamped to 4095 → 0.25 * 4095 + 0.75 * 2000 = 2523.75 → 2524
        assert result == 2524

    def test_custom_alpha(self):
        # α=0.5: 0.5 * 3000 + 0.5 * 1000 = 2000
        assert apply_ema_filter(3000, 1000, alpha=0.5) == 2000

    def test_convergence(self):
        """After many identical inputs, filter should converge to target within integer precision."""
        val = 0
        for _ in range(100):
            val = apply_ema_filter(2000, val)
        assert abs(val - 2000) <= 1


# ──────────────────────────────────────────────────────────────
#  CRUD / Persistence tests (using in-memory SQLite)
# ──────────────────────────────────────────────────────────────

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base
import models  # Ensure all SQLAlchemy models are registered


@pytest.fixture
def db_session():
    """In-memory SQLite database for each test."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine)
    session = TestingSession()
    yield session
    session.close()
    engine.dispose()


class TestCrudCalibration:
    def test_seed_creates_sensors(self, db_session):
        import crud
        crud.init_db_seed(db_session)
        configs = crud.get_all_sensor_configs(db_session)
        assert len(configs) == 11
        # All should have version=1 and source=factory
        for c in configs:
            assert c.calibration.version == 1
            assert c.calibration.source == "factory"

    def test_tare_bumps_version(self, db_session):
        import crud
        crud.init_db_seed(db_session)
        result = crud.apply_tare_offset(db_session, "fsr_thumb", 200)
        assert result is not None
        assert result.calibration.version == 2
        assert result.calibration.source == "tare"
        assert result.calibration.minAdc == 200

    def test_guided_calibration_persists(self, db_session):
        import crud
        crud.init_db_seed(db_session)
        result = crud.apply_guided_calibration(
            db_session, "fsr_thumb",
            min_adc=150, max_adc=3800,
            zero_offset=150, source="guided",
            notes="Test guided calibration",
        )
        assert result is not None
        assert result.calibration.version == 2
        assert result.calibration.source == "guided"
        assert result.calibration.minAdc == 150
        assert result.calibration.maxAdc == 3800

    def test_guided_calibration_rejects_invalid_range(self, db_session):
        import crud
        crud.init_db_seed(db_session)
        with pytest.raises(ValueError, match="strictly less than"):
            crud.apply_guided_calibration(
                db_session, "fsr_thumb",
                min_adc=3000, max_adc=1000,
                zero_offset=None, source="manual",
                notes="Should fail",
            )

    def test_guided_calibration_rejects_equal_range(self, db_session):
        import crud
        crud.init_db_seed(db_session)
        with pytest.raises(ValueError, match="strictly less than"):
            crud.apply_guided_calibration(
                db_session, "fsr_thumb",
                min_adc=2000, max_adc=2000,
                zero_offset=None, source="manual",
                notes="Should fail",
            )

    def test_factory_reset(self, db_session):
        import crud
        crud.init_db_seed(db_session)
        # First change calibration
        crud.apply_guided_calibration(
            db_session, "fsr_thumb",
            min_adc=500, max_adc=3000,
            zero_offset=500, source="manual", notes="",
        )
        # Then reset
        result = crud.reset_sensor_to_factory(db_session, "fsr_thumb")
        assert result.calibration.minAdc == 120
        assert result.calibration.maxAdc == 3950
        assert result.calibration.source == "factory"
        assert result.calibration.version == 3  # seed=1, guided=2, reset=3

    def test_calibration_history_recorded(self, db_session):
        import crud
        crud.init_db_seed(db_session)
        crud.apply_tare_offset(db_session, "fsr_thumb", 200)
        crud.apply_guided_calibration(
            db_session, "fsr_thumb",
            min_adc=200, max_adc=3500,
            zero_offset=200, source="guided", notes="Test",
        )
        history = crud.get_calibration_history(db_session, "fsr_thumb")
        assert len(history) == 3  # factory + tare + guided
        assert history[0].version == 3  # most recent first
        assert history[2].version == 1  # oldest

    def test_sensor_not_found_returns_none(self, db_session):
        import crud
        crud.init_db_seed(db_session)
        assert crud.apply_tare_offset(db_session, "nonexistent", 100) is None
        assert crud.apply_guided_calibration(
            db_session, "nonexistent",
            min_adc=0, max_adc=4095,
            zero_offset=0, source="manual", notes="",
        ) is None

    def test_session_captures_calibration_snapshot(self, db_session):
        import crud
        crud.init_db_seed(db_session)
        # Bump fsr_thumb to version 2
        crud.apply_tare_offset(db_session, "fsr_thumb", 200)
        session = crud.create_session(db_session, "Test", "", "simulated", 20)
        assert session.calibrationSnapshot["fsr_thumb"] == 2
        assert session.calibrationSnapshot["fsr_index"] == 1  # unchanged
