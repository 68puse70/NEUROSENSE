# Chapter 1: Introduction

> **This chapter presents an overview of the NeuroSense wearable monitoring system, highlighting the biomechanical challenges in post-stroke and neuromuscular hand rehabilitation. It establishes the motivation behind portable sensing, formalizes the core objectives, delineates project scope, and provides an architectural outline of the subsequent report chapters.**

## 1.1 Background
The human hand is one of the most intricate and biomechanically sophisticated anatomical structures in the human body, comprising 27 degrees of freedom governed by complex interplays between extrinsic forearm musculature, intrinsic palmar muscles, tendons, and articular ligaments. Fine motor coordination—encompassing precise finger flexion, opposition, tactile pressure regulation, and spatial orientation—is essential for the independent execution of Activities of Daily Living (ADLs) such as grasping utensils, writing, holding cups, and manipulating objects.

Neurological trauma, cerebrovascular accidents (ischemic or hemorrhagic stroke), spinal cord injuries, traumatic brain injuries (TBI), and progressive neurodegenerative conditions (such as Parkinson's disease, multiple sclerosis, and peripheral neuropathies) frequently lead to severe upper-extremity motor impairments. Post-stroke hemiparesis, for example, typically manifests as muscle flaccidity, severe spasticity, flexion synergy patterns, reduced range of motion (ROM), and diminished grasp force in the contralateral hand. In addition, orthopedic trauma, tendon repairs, and inflammatory joint disorders such as rheumatoid arthritis severely compromise the mechanical compliance and tactile sensitivity of finger digits.

Clinical neuro-rehabilitation relies heavily on neuroplasticity—the physiological capacity of the central nervous system to re-establish neural pathways and motor engrams through repetitive, high-intensity, task-specific motor exercises. However, the therapeutic efficacy of motor rehabilitation depends fundamentally on continuous, objective, and quantitative assessment of kinematic recovery and kinetic grasp progress over time. Traditionally, clinical assessments of hand function are conducted using subjective semi-quantitative clinical scoring scales, including:
1. **Fugl-Meyer Assessment (FMA)** of Upper Extremity Motor Function.
2. **Action Research Arm Test (ARAT)**.
3. **Box and Block Test (BBT)**.
4. **Jamar Hand Dynamometer** and mechanical pinch gauges for static grip force measurement.
5. **Manual Universal Goniometers** for joint-angle range-of-motion measurements.

While these manual tools remain standard clinical reference benchmarks, they exhibit fundamental operational limitations. Goniometric measurements require physical manual alignment along narrow phalangeal joints, introducing substantial inter-rater and intra-rater variability (often exceeding $\pm 8^\circ$ to $12^\circ$). Jamar dynamometers provide only static, momentary grip-force peaks and cannot track dynamic pressure distribution across individual contact surfaces during functional grasping tasks.

Furthermore, high-precision laboratory technologies—such as optical motion capture systems (e.g., Vicon, Qualisys) employing infrared retro-reflective markers—are exorbitantly expensive (costing upwards of $\$25,000$ to $\$100,000$), demand specialized calibration rooms, suffer from severe line-of-sight visual occlusions when fingers curl inward during grasp, and require lengthy participant setup times.

Consequently, conventional motor monitoring is restricted to periodic, bi-weekly hospital visits. In the intervals between outpatient visits, patients perform prescribed home motor exercises without real-time physiological feedback, resulting in poor patient compliance, incorrect motor movement execution, and a lack of objective longitudinal recovery records for supervising physiotherapists. There exists an acute technological imperative for low-cost, portable, wearable biomechanical sensing systems capable of providing continuous, objective, multi-modal hand kinematics and tactile grip force monitoring in domestic, decentralized rehabilitation settings.

## 1.2 Motivation
The primary motivation behind the **NeuroSense** system arises from the growing global burden of upper-limb motor disabilities and the systemic economic and geographical barriers associated with facility-based physiotherapy. With rising life expectancies and increasing stroke survivorship, healthcare infrastructures worldwide face severe shortages of certified occupational and physical therapists. Patients residing in rural, suburban, or underserved regions face substantial travel burdens, long waiting queues, and high out-of-pocket transportation and consultation expenses.

The COVID-19 pandemic further exposed the structural vulnerability of centralized healthcare facilities, highlighting an urgent need for decentralized tele-rehabilitation paradigms that enable clinicians to monitor patient motor performance remotely while allowing individuals to practice functional tasks safely in their home environments.

Wearable sensing datagloves offer an ideal technological vehicle to bridge this divide. By integrating thin, flexible resistive bend sensors directly along the anatomical axes of the fingers, piezoresistive force sensors across the palmar contact regions, and micro-electro-mechanical systems (MEMS) inertial measurement units (IMUs) over the dorsal hand, a wearable glove can capture the full biomechanical state of the hand during natural unencumbered movements.

However, existing research datagloves and commercial systems suffer from substantial limitations:
- **Commercial datagloves** (such as CyberGlove, 5DT Data Glove, and Manus Prime) are primarily engineered for virtual reality, motion animation, or specialized tele-robotics. They carry prohibitively high price tags ($\$2,500$ to $\$15,000$), rely on fragile optical fiber ribbons or rigid mechanical linkages, lack integrated contact pressure sensing, and depend entirely on tethered desktop workstations.
- **Academic research prototypes** frequently omit standalone operation, demanding that the wearable remain permanently cabled to laboratory DAQ equipment or high-end microcomputers. Crucially, most lack on-device local visual feedback for the user, rendering them unusable as standalone daily assistive devices without a powered PC nearby.

The core motivation of this project is to develop **NeuroSense**—a cost-effective, self-contained, multi-modal wearable sensor glove utilizing an ESP32 microcontroller, five individual resistive flex sensors, a force-sensitive resistor (FSR), a 6-DOF MPU6050 IMU, an on-device OLED local display, and an on-board rechargeable battery power subsystem with a 5V boost converter.

To complement this standalone hardware glove, an auxiliary, modular software suite—the **NeuroSense Master Dashboard**—was engineered using modern web technologies (FastAPI and React) to serve as a peripheral session recorder and visualization platform. This companion platform allows therapists to inspect live multi-channel waveforms, monitor biomechanical loads, record patient rehabilitation sessions to local storage, and export structured CSV telemetry for historical progression tracking, without compromising the glove's standalone portability.

## 1.3 Scope of the Project
The scope of the NeuroSense project is precisely bounded within the domain of embedded electronics, sensor instrumentation, signal conditioning, wearable biomechanics, and modular software telemetry:
1. **Hardware Sensing Envelope:** Design and fabrication of an embedded sensor glove incorporating five independent flex sensor channels (dedicated to the Thumb, Index, Middle, Ring, and Pinky finger metacarpophalangeal and interphalangeal joints), one high-dynamic-range Force Sensitive Resistor (FSR) positioned at the palmar/thenar grip nexus, and an I2C-based MPU6050 6-DOF IMU positioned securely on the dorsal carpus.
2. **Signal Conditioning & Embedded Acquisition:** Implementation of optimized voltage divider topologies on a dedicated perfboard circuit, interfacing with the 12-bit Analog-to-Digital Converter (ADC) channels of an ESP32 DevKit running Arduino C++ firmware. Signal filtering includes 4-sample moving average smoothing to eliminate high-frequency capacitive noise and 60 Hz mains interference.
3. **On-Device Standalone Feedback:** Integration of an on-device I2C OLED display module, enabling the wearable glove to present real-time flexion status, grip contact indications, and battery power levels to the patient immediately without requiring an active computer or smartphone connection.
4. **Autonomous Power Management Subsystem:** Engineering a portable, rechargeable power circuit consisting of a 3.7V Lithium-ion cell, a TP4056 constant-current/constant-voltage (CC/CV) battery management board with undervoltage protection, and an MT3608/SX1308 DC-DC step-up boost converter providing a stable, regulated 5.0V rail to the ESP32 VIN input with common circuit grounding.
5. **Modular Peripheral Telemetry Suite (NeuroSense Master Dashboard):** Development of an auxiliary, optional web dashboard and FastAPI backend running on local workstations. The scope of this dashboard is strictly defined as an *additional companion tool* for patient session recording, real-time waveform display, and CSV data archival.
6. **Data Processing Paradigm (No Artificial Datasets):** Explicitly, the project operates entirely on deterministic physical sensor transduction, mathematical voltage divider models, and physical angular/force calibration curves. The project deliberately does *not* utilize synthetic or external machine-learning datasets.
7. **Educational Scope Disclaimer:** NeuroSense is designed and tested as an academic engineering prototype and functional proof-of-concept. It is not a certified medical, diagnostic, surgical, or life-critical therapeutic device.

## 1.4 Objectives of the Project
The overarching objective of this work is to realize an accurate, low-cost, multi-modal wearable biomechanical monitoring system. The specific functional and experimental objectives are structured as follows:
- **Objective 1 (Multi-Finger Flexion Sensing):** Implement five independent flex sensor channels to capture dynamic angular flexion across all five digits of the human hand simultaneously, achieving consistent angular resolution from $0^\circ$ (flat extended hand) to $90^\circ$ (full composite flexion).
- **Objective 2 (Palmar Contact Force Acquisition):** Integrate a high-sensitivity Force Sensitive Resistor (FSR) at the primary palmar grasp contact point to detect tactile grip initiation, contact pressure, and sustained hold forces up to 1000 gf.
- **Objective 3 (Hand Kinematic & Spatial Orientation Tracking):** Interface an MPU6050 6-DOF IMU over the I2C serial protocol ($400\text{ kHz}$) to acquire 3-axis linear acceleration and 3-axis angular rates, implementing on-board pitch and roll estimation via complementary filtering.
- **Objective 4 (Embedded Signal Processing & Filtering):** Develop robust firmware on the ESP32 microcontroller incorporating multi-channel 12-bit ADC digitization, 11 dB attenuation configuration ($0\text{--}3.3\text{ V}$ input swing), multi-sample averaging to suppress electrical noise, and high-speed telemetry framing at $50\text{ Hz}$ ($20\text{ ms}$ interval).
- **Objective 5 (Standalone Local Display Readout):** Implement real-time local display feedback on the physical prototype, allowing patients to view instantaneous finger bend percentages and grasp status without relying on peripheral computing hardware.
- **Objective 6 (Rechargeable Portable Power Architecture):** Construct a safe, autonomous power supply utilizing a single-cell Li-ion battery, TP4056 charging interface, and a DC-DC 5V boost regulator, validating thermal and voltage stability across extended operation.
- **Objective 7 (Peripheral Session Recording Suite):** Create an auxiliary web dashboard (React/TypeScript and FastAPI) providing a 2D anatomical sensor heatmap, live multi-channel time-series streaming, and automated patient session recording with SQLite persistence and CSV export for clinical reviews.
- **Objective 8 (Empirical Benchtop Validation):** Conduct systematic physical bench testing using calibrated protractor jigs and precision weights to determine transfer functions, repeatability, latency, power consumption, and operating autonomy.

## 1.5 Brief Description of Project Undertaken
The NeuroSense system was conceived, engineered, and experimentally characterized by the student project team as an integrated cyber-physical sensing platform. The system architecture segregates hardware real-time embedded acquisition from peripheral session analytics:

```
+-----------------------------------------------------------------------------------+
|                        NEUROSENSE CORE WEARABLE PROTOTYPE                         |
|                                                                                   |
|  [5 Flex Sensors]       [1 FSR Pressure]        [MPU6050 6-DOF IMU]               |
|  (Finger Curvature)     (Palmar Grip Load)      (Spatial Orientation)             |
|          |                       |                       |                        |
|          +-----------------------+-----------------------+                        |
|                                  |                                                |
|                                  v (Analog Dividers + I2C Bus)                    |
|                    +---------------------------+                                  |
|                    |     ESP32 DevKit Core     | <--- [Rechargeable Power Path]   |
|                    |  - 12-bit ADC Sampling    |      (Li-ion + TP4056 + 5V Boost)|
|                    |  - Moving Average Filter  |                                  |
|                    |  - Angular Calibration    |                                  |
|                    +-------------+-------------+                                  |
|                                  |                                                |
|         +------------------------+------------------------+                       |
|         |                                                 |                       |
|         v                                                 v (USB Serial / Wi-Fi)  |
|  [Local OLED Display]                             [Peripheral Telemetry Stream]   |
|  (Immediate Patient Feedback                      (Machine-Readable JSON Frames)  |
|   without External PC)                                    |                       |
+-----------------------------------------------------------|-----------------------+
                                                            |
                                                            v
+-----------------------------------------------------------------------------------+
|                  AUXILIARY PERIPHERAL SESSION RECORDING SUITE                     |
|                  (NeuroSense Master Dashboard - FastAPI + React)                  |
|                                                                                   |
|   - 2D Anatomical Sensor Heatmap                                                  |
|   - Real-Time Multi-Channel Waveform Stream (50 Hz Telemetry Engine)              |
|   - Channel Freshness & Diagnostic Log                                            |
|   - Patient Session Recording, SQLite Archival & CSV Telemetry Export             |
|   * Note: Modular diagnostic companion developed additionally for session logs    |
+-----------------------------------------------------------------------------------+
```

The primary physical component is the wearable sensor glove, worn on the user's hand. When the patient flexes their fingers or applies grasping pressure against an object, the five flex sensors and palmar FSR undergo dynamic changes in electrical resistance. Precision voltage divider circuits translate these resistance variations into analog voltage signals that are sampled by the ESP32's 12-bit ADC. Concurrently, the MPU6050 IMU samples 3-axis accelerometer and gyroscope vectors over the I2C bus.

The ESP32 firmware executes a digital moving average filter across the sampled channels, computes normalized flexion percentages, and writes critical parameters to the on-device local OLED display. For enhanced clinical monitoring, the firmware packages calibrated sensor values into structured JSON frames and transmits them across a high-speed telemetry link (USB Serial / Wi-Fi HTTP POST) to the host computer.

On the host workstation, the auxiliary **NeuroSense Master Dashboard** receives the telemetry stream. The dashboard visualizes real-time sensor dynamics through a dark-themed "Precision Lab" interface, mapping finger flexion and tactile pressure directly onto an interactive 2D anatomical hand heatmap while rendering multi-channel scrolling time-series plots. Clinicians can initiate and terminate recording sessions, which are automatically indexed in a local SQLite database and can be exported as standard CSV files for biomechanical analysis.

The software repository containing the dashboard and backend source code is publicly hosted at [https://github.com/68puse70/NEUROSENSE](https://github.com/68puse70/NEUROSENSE).

## 1.6 Organization of the Report
The subsequent chapters of this report are structured systematically to document the engineering design, scientific principles, and experimental results of the NeuroSense project:
- **Chapter 2 (Literature Survey):** Reviews contemporary research publications, commercial datagloves, and wearable sensing methodologies. It provides a detailed comparative study table contrasting six representative systems and defines the specific research gap addressed by NeuroSense.
- **Chapter 3 (Mathematical Background, Logical Thinking & Project Design):** Details the transduction physics of piezoresistive flex sensors, force-sensitive resistors, and MEMS IMUs. It derives the mathematical equations for voltage divider transfer functions, ADC quantization, and complementary filter orientation fusion. It provides the full circuit design, power budget calculations, system block diagram, and detailed flowcharts for both embedded acquisition and auxiliary session logging.
- **Chapter 4 (Implementation and Experimentation):** Documents the physical glove prototyping, perfboard assembly, ESP32 firmware implementation, standalone OLED display integration, and power subsystem validation. It presents an in-depth walkthrough of the auxiliary NeuroSense Master Dashboard interface and clarifies the session recording workflow.
- **Chapter 5 (Results, Testing and Discussion):** Presents quantitative empirical benchtop calibration results, including sensor voltage-angle response curves, force-resistance characteristics, orientation stability, system sampling rates, packet latency, and battery autonomy. It concludes with a critical comparative discussion between standalone operation and dashboard recording.
- **Chapter 6 (Conclusions and Scope for Further Work):** Summarizes the achieved engineering milestones, discusses prototype limitations, and outlines future technological enhancements, including flexible PCB fabrication, wireless BLE streaming, and clinical pilot studies.
- **References & Appendices:** Contains formal academic citations [1]–[14], pin mapping tables, and the complete ESP32 firmware source code.

---

### Chapter Summary
Chapter 1 introduced the clinical necessity of wearable biomechanical sensing for upper-extremity neuromuscular and post-stroke rehabilitation. It defined the project's background, motivation, scope, and primary functional objectives, presenting a clear high-level architectural overview distinguishing the standalone wearable glove core from the auxiliary session recording dashboard.

### Outline of Next Chapter
Chapter 2 presents a comprehensive literature survey examining existing glove-based sensing systems, commercial datagloves, and academic prototypes. It establishes a critical comparative analysis table and formalizes the technical research gap that NeuroSense addresses.
