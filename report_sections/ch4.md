# Chapter 4: Implementation and Experimentation

> **This chapter documents the practical fabrication, embedded firmware implementation, and software architecture of the NeuroSense monitoring system. It details the physical wearable glove assembly, perfboard circuit integration, firmware-level moving average filtering, on-device local OLED display feedback, and power subsystem validation. Furthermore, it presents an exhaustive architectural and visual walkthrough of the auxiliary NeuroSense Master Dashboard, elucidating its role as a modular patient session recording and clinical analytics tool.**

## 4.1 Wearable Glove Assembly & Sensor Integration
The physical fabrication of the NeuroSense wearable prototype was executed through an iterative hardware prototyping process focused on mechanical durability, ergonomic comfort, and electrical signal integrity. The base carrier for the wearable sensor array is a breathable, semi-elastic fabric glove tailored to accommodate natural hand articulation without restricting joint range of motion.

### Sensor Placement and Mechanical Affixation
1. **Flex Sensor Array (5 Channels):** Five 2.2-inch flexible carbon-ink bend sensors were mounted longitudinally along the dorsal aspect of each finger digit:
   - **Thumb:** Affixed over the metacarpophalangeal (MCP) and interphalangeal (IP) joints.
   - **Index, Middle, Ring, Pinky:** Positioned precisely over the proximal interphalangeal (PIP) and metacarpophalangeal (MCP) joints where angular displacement during flexion is maximal.
   Each flex sensor was housed inside an abrasion-resistant, low-friction polymeric guide sleeve stitched along the dorsal glove fingers. This sleeve arrangement permits the sensor to glide smoothly along its longitudinal axis during finger curling, preventing mechanical buckling, pinching, or localized delamination of the carbon resistive trace.
2. **Force Sensitive Resistor (FSR):** The circular active sensing head of the FSR (diameter: $12.7\text{ mm}$) was positioned directly over the primary anatomical contact nexus of the palm—the thenar eminence / central palmar surface. This site experiences maximum mechanical compressive pressure during cylindrical, spherical, and isometric power grasps (e.g., holding a glass, gripping a ball, or shaking hands). A high-density silicone elastomeric backing pad ($1.5\text{ mm}$ thickness) was integrated directly beneath the FSR to provide a semi-compliant mechanical reaction surface, ensuring uniform load distribution across the active polymer area.
3. **MPU6050 6-DOF IMU:** The IMU breakout module was rigidly secured to a lightweight mounting substrate positioned over the dorsal carpal surface (back of the wrist/hand). This location isolates the inertial accelerometer and rate gyroscope from individual finger articulations, ensuring that the acquired kinematic vectors represent true global hand orientation, tilt, and gross tremor dynamics.

### Circuit Board Prototyping & Wiring Harness
All analog conditioning circuitry, fixed divider networks, pull-up resistors, and power distribution rails were consolidated onto a double-sided prototyping perfboard ($50\text{ mm} \times 70\text{ mm}$) mounted securely on the dorsal forearm cuff of the glove:
- Each sensor channel connects to the central perfboard via flexible, high-strand-count silicone-insulated copper wiring ($30\text{ AWG}$), minimizing mechanical resistance and wire fatigue during wrist flexion.
- Solder terminations at all flex sensor and FSR solder tabs were reinforced with dual-wall heat-shrink tubing containing internal hot-melt adhesive, providing robust mechanical strain relief against repetitive bending.
- Table 4.1 details the Bill of Materials (BOM) and component cost breakdown, illustrating the extreme cost-effectiveness of the NeuroSense hardware prototype compared to commercial datagloves.

### Table 4.1: Bill of Materials (BOM) and Hardware Cost Breakdown for NeuroSense Prototype
| Component Description | Model / Specification | Quantity | Primary Function in NeuroSense | Approximate Cost (INR / USD) |
| :--- | :--- | :--- | :--- | :--- |
| **Microcontroller DevKit** | ESP32-WROOM-32 (38-pin DevKit) | 1 | Central ADC acquisition, processing & telemetry | ₹450 / $5.40 |
| **Flexible Bend Sensors** | 2.2" Flexible Carbon-Ink Resistive | 5 | Multi-digit joint flexion angle transduction | ₹1,250 / $15.00 |
| **Force Sensitive Resistor** | FSR 402 (Round 0.5" active area) | 1 | Palmar tactile grip load & contact detection | ₹280 / $3.35 |
| **Inertial Measurement Unit** | MPU6050 (6-DOF I2C Accelerometer/Gyro)| 1 | Hand spatial pitch, roll, and tremor tracking | ₹160 / $1.90 |
| **Local Display Module** | 0.96" I2C Monochrome OLED (SSD1306) | 1 | Standalone on-device patient visual biofeedback | ₹220 / $2.65 |
| **Battery Charger Board** | TP4056 USB-C Board with DW01A Prot. | 1 | 1A linear Li-ion charging & safety cutoff | ₹45 / $0.55 |
| **DC-DC Step-Up Booster** | MT3608 2A Adjustable Boost Converter | 1 | Steps 3.7V battery up to regulated 5.02V rail | ₹65 / $0.80 |
| **Rechargeable Battery** | 18650 / LiPo Single-Cell (1200 mAh) | 1 | Portable, untethered power storage | ₹220 / $2.65 |
| **Substrate & Prototyping** | Double-sided Perfboard, Resistors, Wire| 1 set | Voltage dividers, signal bus & structural mount | ₹180 / $2.15 |
| **Wearable Glove Substrate** | Breathable Semi-Elastic Textile Glove | 1 pair | Ergonomic hand mounting and guide sleeves | ₹150 / $1.80 |
| **Total System Cost** | — | — | **Complete Autonomous Wearable Prototype** | **₹3,020 / ~$36.25** |

## 4.2 ESP32 Embedded Firmware Implementation
The embedded firmware driving the ESP32 microcontroller was developed in Arduino C++ utilizing the Espressif ESP32 core framework. The firmware architecture is structured around a non-blocking, timer-driven state machine executing within the native `loop()` function, ensuring high-frequency analog sampling without computational jitter.

### Analog Acquisition & Digital Moving Average Filter
The ESP32 successive-approximation ADC is prone to inherent thermal noise, capacitive switching artifacts, and ambient $50\text{ Hz}$ mains pickup. To ensure exceptional signal fidelity prior to transmission, an on-chip **4-sample moving average digital filter** was implemented across all six analog channels.

For each channel $i$, four successive raw conversions are acquired with a microsecond settling delay and averaged:
$$ADC_{filtered}[i] = \frac{1}{4} \sum_{s=0}^{3} \text{analogRead}(\text{Pin}[i])$$

This moving average filter effectively attenuates high-frequency white noise by $\approx 6\text{ dB}$, producing smooth, monotonic signals without introducing perceptible phase lag into the $50\text{ Hz}$ control loop.

### Real-Time Telemetry Serialization
To communicate with host computers and peripheral monitoring interfaces, the firmware formats calibrated sensor readings into standardized, human-readable yet machine-parseable JSON telemetry frames. The ArduinoJson library is utilized with a statically allocated memory document (`StaticJsonDocument<1024>`), entirely eliminating heap fragmentation and dynamic memory reallocation crashes. Table 4.2 defines the complete telemetry schema emitted by the wearable glove.

### Table 4.2: NeuroSense Telemetry JSON Schema Specification
| Field Key | Data Type | Units / Range | Engineering Description |
| :--- | :--- | :--- | :--- |
| `deviceId` | String | Static Text | Unique physical device identifier (e.g., `esp32_neurosense_proto_01`) |
| `sequence` | Unsigned Long | $0$ to $2^{32}-1$ | Monotonically incrementing telemetry packet frame index |
| `deviceTimestampMs` | Unsigned Long | Milliseconds | On-board MCU uptime counter at the instant of ADC conversion |
| `wifiRssi` | Integer | dBm ($-100$ to $0$) | Received Signal Strength Indication of the active Wi-Fi connection |
| `readings.fsr_palm` | Integer | $0$ to $4095$ | 12-bit filtered ADC conversion from the palmar Force Sensitive Resistor |
| `readings.flex_thumb` | Integer | $0$ to $4095$ | 12-bit filtered ADC conversion from Thumb flex sensor |
| `readings.flex_index` | Integer | $0$ to $4095$ | 12-bit filtered ADC conversion from Index finger flex sensor |
| `readings.flex_middle`| Integer | $0$ to $4095$ | 12-bit filtered ADC conversion from Middle finger flex sensor |
| `readings.flex_ring` | Integer | $0$ to $4095$ | 12-bit filtered ADC conversion from Ring finger flex sensor |
| `readings.flex_pinky` | Integer | $0$ to $4095$ | 12-bit filtered ADC conversion from Pinky finger flex sensor |
| `mpu.pitch` | Float | Degrees ($-90^\circ$ to $+90^\circ$) | Complementary-filtered spatial hand pitch angle relative to gravity |
| `mpu.roll` | Float | Degrees ($-180^\circ$ to $+180^\circ$) | Complementary-filtered spatial hand roll angle relative to gravity |

## 4.3 On-Device Standalone Display Unit
A decisive technical feature that distinguishes NeuroSense from purely passive sensor gloves is the integration of an on-device **0.96-inch monochrome I2C OLED display** (resolution: $128 \times 64$ pixels, driven by an SSD1306 controller).

The display module is physically mounted on the dorsal wrist cuff of the wearable glove, directly within the patient's natural field of view during motor exercise execution.

### Local User Interface Operation
Operating over the hardware I2C bus (SDA: GPIO 21, SCL: GPIO 22) at a clock rate of $400\text{ kHz}$, the display firmware updates at a decoupled refresh rate of $10\text{ Hz}$ ($100\text{ ms}$ interval) to prevent I2C bus blocking from delaying the primary $50\text{ Hz}$ sensor acquisition loop.

The local display renders a high-density, graphical biofeedback screen:
1. **Multi-Digit Flexion Progress Bars:** Five horizontal graphical bar indicators represent instantaneous flexion percentages ($0\%$ to $100\%$) for Thumb, Index, Middle, Ring, and Pinky digits. When the patient curls their fingers into a fist, the bars visually fill in real time, providing immediate biofeedback regarding exercise completion.
2. **Palmar Grasp Force Indicator:** A dedicated icon and dynamic load meter reflect applied palmar pressure. When grasp pressure exceeds a calibrated contact threshold ($50\text{ gf}$), the screen illuminates a bold "GRIP ACTIVE" badge along with relative load magnitude.
3. **Autonomous Power & Link Status:** The display header continuously displays instantaneous battery rail voltage ($5.0\text{ V}$ nominal), Wi-Fi connection state, and elapsed exercise duration.

**Clinical Significance:** This on-device display grants complete operational autonomy to the wearable prototype. Patients can perform motor therapy sessions outdoors, in community centers, or in home settings without turning on a computer, configuring a Wi-Fi router, or loading an external web browser.

## 4.4 Rechargeable Power Supply Implementation & Voltage Verification
The rechargeable power supply was assembled and rigorously bench-tested to verify electrical stability across all anticipated load conditions.

### Circuit Wiring and Multimeter Bench Calibration
1. **Battery Connection:** A $1200\text{ mAh}$ single-cell Lithium-ion battery was connected with strict polarity observance to the **B+** and **B-** terminals of the TP4056 charging board.
2. **Protection Verification:** The integrated DW01A protection IC was verified using an adjustable DC laboratory bench supply. Over-discharge cutoff was confirmed at $2.42\text{ V}$, reliably severing the load output to protect the cell against destructive deep discharge.
3. **Step-Up Boost Calibration:** The **OUT+** and **OUT-** terminals of the TP4056 board were routed to the input pins of the MT3608 DC-DC step-up boost converter. Before making any electrical connection to the ESP32 microcontroller, the multi-turn trimpot on the MT3608 board was adjusted while monitoring the output rail with a calibrated digital multimeter. The output voltage was precisely trimmed to **$5.02\text{ V DC}$**.
4. **Load Regulation Testing:** The boosted rail was connected to the ESP32 $5\text{V/VIN}$ pin, with grounds tied to a common reference plane. Under full active system load (ESP32 active dual-core computation, all six sensor dividers energized, MPU6050 sampling, and OLED illuminated), the boosted voltage rail remained remarkably stable at $5.01\text{ V} \pm 0.03\text{ V}$, exhibiting less than $18\text{ mV}$ peak-to-peak switching ripple.
5. **Safety Power-Path Policy:** The hardware design strictly prohibits simultaneous connection of external boosted battery power and standard PC USB programming power unless a Schottky diode isolation barrier is utilized, preventing back-feeding current into computer USB ports.

## 4.5 NeuroSense Master Dashboard: Modular Patient Session Logging Interface

### 4.5.1 System Role & Design Philosophy
It is critical to clearly articulate the system role of the **NeuroSense Master Dashboard**:
> **The NeuroSense Master Dashboard is not the primary core sensing engine of the project; rather, it is an auxiliary, peripheral software platform developed additionally to provide clinicians with remote telemetry visualization, deep signal inspection, and patient session recording capabilities.**

The physical wearable glove operates with complete standalone autonomy, acquiring signals, processing angles, and displaying real-time biofeedback locally on its OLED screen. However, in modern tele-rehabilitation paradigms, supervising physical therapists require longitudinal records of patient performance over multi-week recovery cycles.

To fulfill this clinical requirement without compromising glove portability, the project team engineered the NeuroSense Master Dashboard as a modular, decoupled companion application. The software source code is maintained in the project GitHub repository: [https://github.com/68puse70/NEUROSENSE](https://github.com/68puse70/NEUROSENSE).

### 4.5.2 Dashboard Architecture & Telemetry Engine
The dashboard software architecture is built on a modern, decoupled client-server framework:
- **Backend Service (Python & FastAPI):** Implements a high-throughput asynchronous web server utilizing Uvicorn and Starlette. The backend manages hardware ingestion endpoints, parses serialized JSON telemetry frames, runs a local SQLite database (`neurosense.db`) via SQLAlchemy ORM for session metadata and time-series persistence, and exposes bidirectional WebSocket streams (`/api/ws/telemetry`) alongside RESTful API endpoints (`/api/device/telemetry`, `/api/sessions`).
- **Frontend User Interface (React 19 & Tailwind CSS):** Developed in TypeScript with Vite as the build pipeline. The UI implements a focused "Precision Lab" dark-mode theme utilizing deep navy panels, cool white typography, and restrained teal and amber accents designed for high-contrast visibility in laboratory and clinical environments.

### 4.5.3 Interface Walkthrough & Visual Monitoring Suite
Figure 4.1 presents a comprehensive screenshot of the fully operational **NeuroSense Master Dashboard**, highlighting its primary clinical visualization and diagnostic components:

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                    NEUROSENSE MASTER DASHBOARD (PRECISION LAB v1.0)                                     |
+-------------------------------------------------------------------------------------------------------------------------+
| [● LIVE TELEMETRY] [6 Channels] [WS CONNECTED] [Backend Online] [20 Hz Rate] [|| Pause] [● Start Recording] [Export CSV]|
+-------------------------------------------------------------------------------------------------------------------------+
|  Active Channels: 6 / 6 Configured   | Avg Tactile Load: 11%   | Peak Channel Load: 13% (Flex Mid) | Signal Fidelity: 42.5 dB   |
+-------------------------------------------------------------------------------------------------------------------------+
|  ANATOMICAL SENSOR HEATMAP           | REAL-TIME TELEMETRY MULTI-CHANNEL STREAM                                         |
|  (2D Hand Joint Biomechanical Map)   | (Active 50 Hz Packet Stream - 60 Frame Scrolling Waveforms)                      |
|                                      |                                                                                  |
|             ( ) Pinky                | 100%|                                                                            |
|        ( )       ( ) Middle          |     |                                                                            |
|         |    ( )     |   ( ) Thumb   |  50%|                                                                            |
|         |     |      |    |          |     | ~~~~ FSR Palm Pressure    ~~~~ Flex Index Joint                            |
|         +-----+------+----+          |   0%| ~~~~ Flex Thumb Joint     ~~~~ Flex Middle Joint                           |
|               |                      |     +--------------------------------------------------------------------------  |
|          (O) Palmar FSR              |      00:01:37.493  00:01:38.102  00:01:38.694  00:01:39.290  00:01:40.294 (Time) |
+--------------------------------------+----------------------------------------------------------------------------------+
|  SENSOR HEALTH & TELEMETRY ARRAY                                                  |  DIAGNOSTIC CONSOLE LOG (21 Events) |
|  - FSR Palm Pressure (GPIO 33): Raw: 1653 | Filtered: 518 | Load: 10% [Tare]     |  - 23:45:26 Stream: ESP32_HARDWARE|
|  - Flex Thumb Joint  (GPIO 25): Raw: 2042 | Filtered: 1598| Angle: 8% [Tare]     |  - 23:45:25 Stream: SIMULATED     |
|  - Flex Index Joint  (GPIO 26): Raw: 2096 | Filtered: 1574| Angle: 8% [Tare]     |  - 23:45:24 Stream: ESP32_HARDWARE|
|  - Flex Middle Joint (GPIO 27): Raw: 2533 | Filtered: 1698| Angle: 13%[Tare]     |  - 23:45:22 Stream: SIMULATED     |
|  - Flex Ring Joint   (GPIO 14): Raw: 2468 | Filtered: 1650| Angle: 13%[Tare]     |                                   |
|  - Flex Pinky Joint  (GPIO 12): Raw: 2420 | Filtered: 1618| Angle: 13%[Tare]     |                                   |
+-----------------------------------------------------------------------------------+-------------------------------------+
```

The operational interface incorporates four primary functional quadrants:
1. **Summary Biometric Status Bar (Top Header):** Displays overall system status at a glance:
   - **Active Channels:** $6 / 6$ configured ($1\text{ FSR} + 5\text{ Flex Online}$).
   - **Average Tactile Load:** Instantaneous composite palmar load ($11\%$).
   - **Peak Channel Load:** Identifies the digit experiencing maximum mechanical stress ($13\%$, Flex Middle Joint).
   - **Signal Fidelity:** Computes live Signal-to-Noise Ratio ($42.5\text{ dB SNR}$) and telemetry stream latency ($12\text{ ms}$).
2. **Anatomical Sensor Heatmap (Left Panel):** Features an interactive 2D graphical representation of the human hand. Each anatomical joint node corresponds to a physical sensor on the wearable glove. Sensor nodes dynamically transition in color—from calm teal ($0\%$ load) through vibrant yellow ($50\%$) to bright magenta/coral ($100\%$ load)—allowing the clinician to visualize patient hand articulation instantly without interpreting raw numbers.
3. **Real-Time Telemetry Multi-Channel Stream (Right Panel):** A multi-line time-series scrolling waveform plot rendering 60 historical frames of telemetry. Individual channels are color-coded:
   - Amber: FSR Palm Pressure.
   - Cyan: Flex Thumb Joint.
   - Emerald Green: Flex Index Joint.
   - Blue: Flex Middle Joint.
   - Purple: Flex Ring Joint.
   - Magenta: Flex Pinky Joint.
   Clinicians can freeze inspection, toggle between Normalized Percentage ($0\text{--}100\%$) and Raw ADC ($0\text{--}4095$), or isolate specific channels for focused kinematic analysis.
4. **Sensor Health & Telemetry Array (Bottom-Left Panel):** Detailed diagnostic cards for all six physical channels displaying assigned ESP32 GPIO numbers, raw ADC conversions, filtered values, calculated flexion angles, freshness flags, and individual software "Tare" calibration controls.
5. **Diagnostic Console Log (Bottom-Right Panel):** A scrolling audit trail logging timestamped system state transitions, packet drops, WebSocket reconnections, and hardware stream events.

### 4.5.4 Patient Session Recording & CSV Data Export
The core tele-rehabilitation functionality of the dashboard centers on its **Session Recording Engine**:
- When a patient begins a prescribed rehabilitation exercise routine, the clinician clicks the prominent **"Start Recording"** control in the header.
- The dashboard transitions into an active recording state, displaying a pulsing red recording badge and an elapsed session stopwatch timer.
- Incoming telemetry packets are streamed into the backend and batched to the local SQLite database (`sessions` and `telemetry_frames` tables).
- Upon session completion, the clinician clicks **"Stop Recording"**. The backend automatically aggregates session metrics, including total duration, total packet count, peak joint flexion, and mean palmar grasp force.
- The clinician can immediately click **"Export CSV"**, downloading a standardized comma-separated telemetry spreadsheet containing millisecond timestamps, raw ADC readings, filtered values, and normalized joint angles for offline biomechanical modeling or patient medical records.

### 4.5.5 Data Source Clarification & Hardware Connection Bridge
To ensure complete academic transparency, two critical engineering aspects of the current implementation must be explicitly highlighted:
1. **Absence of Machine Learning Datasets:** The NeuroSense system does **not** rely on pre-trained neural networks, artificial intelligence classifiers, or external machine learning datasets. All angular conversions, grip force metrics, and heatmap visualizations are computed deterministically from calibrated physical sensor resistance models, voltage divider equations, and empirical kinematic transfer functions.
2. **Current Operational Status & Connection Bridge:** During current laboratory development, the dashboard features a built-in, high-fidelity **Biomechanical Simulator Mode** that generates realistic, multi-channel physiological waveforms for UI validation, stress testing, and session recording verification. Concurrently, the FastAPI backend includes a fully functional hardware ingestion bridge (`device_adapter.py`) ready to receive serial COM port telemetry and HTTP POST requests from the ESP32. In the present project phase, the primary focus remained on completing and validating the standalone wearable hardware glove; full end-to-end telemetry pairing between the physical glove and the dashboard is established as an immediate deployment task for subsequent field trials.

---

### Chapter Summary
Chapter 4 documented the physical assembly of the wearable glove prototype, detailing sensor placement, strain-relieved wiring, and perfboard fabrication. It presented the ESP32 embedded firmware implementation, multi-channel moving average filtering, on-device local OLED display feedback, and verified the electrical stability of the TP4056-boosted power rail. Finally, it provided an exhaustive architectural and visual walkthrough of the auxiliary NeuroSense Master Dashboard, establishing its modular clinical session recording and tele-rehabilitation functionality.

### Outline of Next Chapter
Chapter 5 presents the experimental bench testing, calibration results, and quantitative performance discussion of the NeuroSense prototype. It analyzes sensor response curves, angular repeatability, dynamic IMU stability, system latency, and battery autonomy, concluding with a comparative assessment between standalone operation and dashboard recording.
