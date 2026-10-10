# NeuroSense Dashboard - Project Summary & Status Document

**Project Name:** NeuroSense Dashboard (Neuromotor Sensor Monitoring System)  
**Version:** 1.0.0  
**Last Updated:** October 10, 2026  
**Tech Stack:** React 19, TypeScript 5, Vite 6, TailwindCSS 3, Recharts 2, Lucide React, FastAPI (Python), SQLite, ESP32 Firmware (C++)

---

## 1. Executive Overview

The **NeuroSense Dashboard** is a real-time visualization, telemetry acquisition, calibration, and analytics platform designed for a neuromotor sensor glove. The system captures analog readings from hand sensors at **50Hz**, processes and normalizes the data, streams it via WebSockets, and provides interactive visualizations for clinical and research telemetry analysis.

---

## 2. Hardware & Sensor Specs

The hardware configuration is customized for a 6-channel sensor array:

| Sensor ID | Sensor Name | Type | Location | Hardware Pin | Range |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fsr_palm` | FSR Palm Pressure | Force Sensitive Resistor | Palm Center | GPIO A0 | 0–4095 ADC (0–100%) |
| `flex_thumb` | Flex Thumb Joint | Flex Sensor | Thumb Joint | GPIO A1 | 0–4095 ADC (0–100%) |
| `flex_index` | Flex Index Finger | Flex Sensor | Index Joint | GPIO A2 | 0–4095 ADC (0–100%) |
| `flex_middle` | Flex Middle Finger | Flex Sensor | Middle Joint | GPIO A3 | 0–4095 ADC (0–100%) |
| `flex_ring` | Flex Ring Finger | Flex Sensor | Ring Joint | GPIO A4 | 0–4095 ADC (0–100%) |
| `flex_pinky` | Flex Pinky Finger | Flex Sensor | Pinky Joint | GPIO A5 | 0–4095 ADC (0–100%) |

- **Sampling Rate:** 50 Hz (20ms sampling window)
- **Resolution:** 12-bit ADC (Raw range: 0–4095, Normalized: 0.0–1.0 / 0–100%)

---

## 3. Web Application Structure & Modules

### A. Pages & Views

1. **Dashboard Overview (`/`)**
   - **4 Live Metric Cards:** FSR Palm Pressure, Average Flex Angle, Active Channel Count (6/6), System Telemetry Health & FPS.
   - **Real-Time Telemetry Chart:** Multi-line graph with toggleable sensor channels, auto-scrolling time axis, and interactive tooltips.
   - **Quick Action Bar:** Stream pause/resume, session recording control, emergency stop toggle.

2. **Live Monitor (`/monitor`)**
   - **Channel-by-Channel Drilldown:** Dedicated visual cards for each of the 6 sensors displaying live gauge bars, raw ADC values, normalized voltage, and min/max bounds.
   - **Live Telemetry Matrix:** Tabular telemetry log showing microsecond-precise timestamps and exact raw vs. scaled values per channel.
   - **Channel Filtering:** Instant filter by sensor group (FSR vs Flex Sensors).

3. **Guided Calibration (`/calibration`)**
   - **2-Step Calibration Wizard:**
     - **Step 1 (Rest Baseline):** Captures relaxed hand state to compute zero-point offset.
     - **Step 2 (Max Flex/Grip):** Captures full fist / maximum flex state to establish upper normalization scale.
   - **Live Stability Bar:** Real-time variance meter ensuring hand stability during capture.
   - **Calibration Profile Saving:** Saves gain and offset factors directly to local memory & backend.

4. **Sessions & Data Management (`/sessions`)**
   - **Session Recorder:** Start, pause, and stop telemetry session recordings with live duration timer and frame counter.
   - **Session History Table:** Browse saved recording sessions with metadata (duration, total frames, average force, peak flex).
   - **CSV Export:** Download recording files directly into CSV format for offline statistical analysis (MATLAB, Python, R).
   - **Session Playback:** Replay recorded telemetry data at original or variable playback speed.

5. **Settings & Hardware Config (`/settings`)**
   - **Simulator Controls:** Toggle between mock simulator stream and real WebSocket hardware connection; adjust noise levels and movement patterns (Pinch, Power Grip, Rest, Flutter).
   - **WebSocket Config:** Custom server URL configuration (default: `ws://localhost:8000/ws/telemetry`).
   - **Channel Mapping:** Reassign GPIO pins and custom labels per sensor.

---

### B. Core Components & State Management

- **`SensorContext.tsx`:** Primary React context provider managing:
  - Active telemetry frame buffer (up to 300 historical points).
  - Sensor configurations list.
  - Recording state (isRecording, recordedFrames, activeSession).
  - Connection status (connected, fallback to simulator, ping/latency).
  - Session records & saved calibration coefficients.
- **`LiveTelemetryChart.tsx`:** High-performance SVG/Recharts line plot optimized for 50Hz telemetry updates without UI lag.
- **`MetricsOverview.tsx`:** Grid layout of real-time sensor metrics with color-coded threshold alerts.
- **`Header.tsx` & `Sidebar.tsx`:** Navigation bar with WebSocket connection status, stream controls, recording timer, and responsive sidebar menu.

---

### C. Services & Utilities

- **`sensorSimulator.ts`:** Built-in telemetry generator supporting realistic mathematical wave functions (sine, Gaussian noise, decay curves) to simulate hand dynamics without physical hardware connected.
- **`webSocketClient.ts`:** Reconnecting WebSocket wrapper for low-latency JSON frame streaming from Python backend or ESP32 server.
- **`apiClient.ts`:** Axios/Fetch REST API client for backend CRUD operations.

---

## 4. Backend System (FastAPI + Python)

Located in `c:\NEUROMOTOR SENSOR\dashboard\backend`:

- **`main.py`:** FastAPI entry point handling REST routes and `/ws/telemetry` endpoint.
- **`crud.py`:** Database queries for creating, reading, updating, and deleting telemetry sessions.
- **`models.py` & `schemas.py`:** Database schemas for storing sessions, raw frames, and calibration curves.
- **`device_adapter.py`:** Hardware serial reader communicating with USB COM ports or WiFi sockets.
- **`normalization.py`:** Math module implementing Min-Max scaling, Moving Average filtering, and Butterworth low-pass filtering.
- **`neurosense.db`:** SQLite database for persistent local storage.

---

## 5. Firmware System (ESP32)

Located in `c:\NEUROMOTOR SENSOR\dashboard\firmware`:

- **`esp32_neurosense.ino`:** C++ code for ESP32 microcontrollers:
  - Reads ADC pins A0 (FSR Palm) and A1–A5 (Flex fingers).
  - Applies analog read smoothing.
  - Transmits JSON payload over USB Serial (115200 baud) or WiFi WebSockets:
    ```json
    {
      "timestamp": 1712750000000,
      "readings": {
        "fsr_palm": 1850,
        "flex_thumb": 420,
        "flex_index": 1280,
        "flex_middle": 1340,
        "flex_ring": 1100,
        "flex_pinky": 950
      }
    }
    ```

---

## 6. Development & Build Status

- **Development Server:** Vite dev server active on `http://localhost:3001/` (or `http://<local-ip>:3001/` for network access).
- **TypeScript Compliance:** 0 compilation errors across all source files (`tsc --noEmit` verified).
- **Network Access:** Enabled via `host: true` in `vite.config.ts`.
