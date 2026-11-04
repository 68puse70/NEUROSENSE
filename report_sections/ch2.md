# Chapter 2: Literature Survey

> **This chapter presents a critical review of existing glove-based biomechanical sensing systems, commercial datagloves, and wearable rehabilitation instrumentation reported in contemporary literature. It establishes a comparative taxonomy across transduction methodologies, evaluates their operational limitations, and formalizes the specific technological research gaps addressed by the NeuroSense architecture.**

## 2.1 Overview of Glove-Based Biomechanical Sensing
Quantifying the kinematic trajectories and kinetic forces of the human hand has been a subject of extensive biomechanical and biomedical engineering research for over three decades [1]. The human hand contains 19 articular joints capable of complex multi-planar articulation, including flexural bending, hyperextension, abduction/adduction, and thumb circumduction [2]. To capture these subtle biomechanical parameters unobtrusively, researchers have investigated diverse sensing modalities, which can be broadly classified into:
1. **Resistive and Piezoresistive Transduction:** Utilizes conductive elastomeric polymers, carbon-doped inks, or micro-cracked thin-film metallic coatings that exhibit a change in bulk electrical resistance when subjected to mechanical strain, bending, or compression [3]. Resistive sensors offer substantial advantages in terms of mechanical flexibility, ultra-low profile, direct analog interface compatibility, and cost-effectiveness.
2. **Optical and Fiber-Optic Sensing:** Employs fiber Bragg gratings (FBG) or macro-bending optical fibers in which light attenuation or spectral wavelength shifts correspond to finger curvature [4]. While immune to electromagnetic interference, fiber-optic datagloves require sensitive optoelectronic demodulators, spectrometer modules, and fragile fiber terminations that degrade rapidly under cyclic mechanical fatigue.
3. **Inertial Measurement Units (IMUs):** Employs miniature MEMS accelerometers, gyroscopes, and magnetometers distributed across phalangeal segments [5]. While capable of tracking drift-free 3D spatial orientation, multi-IMU arrays suffer from severe magnetic field distortions caused by ferromagnetic structural objects in domestic environments, accumulate numerical integration drift, and cannot measure surface contact pressure.
4. **Capacitive and Hall-Effect Transduction:** Measures changes in capacitance between elastic conductive plates or magnetic flux variations between permanent neodymium magnets and Hall-effect sensors [6]. Although highly sensitive, these systems require sophisticated shielding against stray parasitic capacitance and ambient magnetic noise.
5. **Computer Vision & Optical Motion Capture:** Utilizes multi-camera infrared marker tracking (e.g., Vicon, Qualisys) or markerless depth imaging (e.g., Leap Motion, Microsoft Kinect) [7]. While non-contact, optical systems are inherently limited by line-of-sight occlusions, restricted spatial capture volumes, ambient lighting sensitivities, and zero tactile pressure sensing capability.

Consequently, multi-sensor wearable gloves combining thin-film piezoresistive flex sensors, contact force-sensitive resistors, and dorsal IMUs offer the most clinically practical, robust, and cost-effective balance for decentralized motor evaluation [8].

## 2.2 Review of Related Works
In this section, seminal academic literature and commercial glove systems are systematically reviewed to examine their technological frameworks, experimental findings, and operational shortcomings.

Simone et al. [1] engineered a wearable dataglove utilizing five commercial flex sensors integrated into a Lycra textile to monitor hand flexion in post-stroke hemiparetic patients. Their system interfaced with an external 16-channel laboratory data acquisition (DAQ) card cabled to a desktop computer. While the authors demonstrated an angular measurement repeatability of $\pm 2.8^\circ$, the system was completely tethered, demanded mains power, lacked any contact pressure sensing, and provided no real-time visual feedback to the patient.

Dipietro et al. [2] conducted an exhaustive clinical evaluation of glove-based systems for neuro-rehabilitation, assessing both commercial instruments (such as the CyberGlove) and academic prototypes. Their findings emphasized that commercial datagloves, originally designed for virtual reality and computer-aided animation, exhibit excessive mechanical stiffness, require complex multi-point calibration protocols taking upwards of 20 minutes per patient, and cost between $\$5,000$ and $\$15,000$, rendering them completely inaccessible for outpatient home deployment.

Popovic et al. [3] proposed a sensorized rehabilitation glove integrating an array of Force Sensitive Resistors (FSRs) positioned across the fingertips and palm to quantify grasp forces during neuro-prosthetic electrical stimulation. Their study highlighted that FSRs exhibit a highly nonlinear, power-law resistance-to-force response and non-trivial mechanical hysteresis. The authors successfully demonstrated grip event detection; however, their glove did not incorporate bend or kinematic sensors, thus failing to capture finger range of motion or hand orientation.

Gentner and Classen [4] investigated an optical dataglove employing optical fibers with etched reflective surfaces to measure finger joint angles. Although achieving high dynamic linearity and immunity to electromagnetic noise, the physical fiber loops across the proximal interphalangeal (PIP) joints were susceptible to micro-fractures under repetitive high-flexion bending, resulting in high maintenance requirements and costly replacement components.

Lin et al. [5] developed a wireless dataglove based entirely on an array of 16 distributed MEMS IMU sensors mounted on each finger segment. By fusing accelerometer and gyroscope measurements through extended Kalman filtering (EKF), their system successfully reconstructed continuous 3D skeletal hand posture. However, the system exhibited significant baseline drift over multi-minute recording sessions and was utterly incapable of detecting whether a finger was lightly touching an object, applying firm grip pressure, or hovering in free space.

Saggio et al. [8] developed a comprehensive piezoresistive sensor array based on carbon nanotube (CNT) screen-printed flexible substrates for biomechanical joint tracking. Their work proved that screen-printed carbon inks provide robust, repeatable resistance changes over 100,000 bending cycles with negligible drift when driven by properly matched voltage divider networks. Their findings validated the feasibility of using low-cost commercial carbon-ink flex sensors for medical angle estimation.

Kortier et al. [9] evaluated the commercial CyberGlove II system in clinical motor assessment protocols. They reported that while the glove provided high-resolution kinematic outputs, its rigid non-stretchable backing restricted natural finger movements in patients suffering from moderate hand spasticity or joint contractures. Furthermore, the reliance on proprietary desktop software prevented customizable integration with modern tele-rehabilitation cloud backends.

Bachmann et al. [10] proposed an inertial-magnetic orientation tracking system for upper-limb biomechanics, implementing quaternion-based complementary filters. Their mathematical formulations demonstrated that fusing low-frequency gravity vectors with high-frequency gyroscope integration effectively mitigates gyroscopic drift, establishing the theoretical baseline for the orientation estimation algorithms utilized in NeuroSense.

Oulasvirta et al. [11] investigated user compliance in remote motor therapy, demonstrating that patient engagement increases by over 65% when wearable rehabilitation devices provide immediate, on-device visual feedback (such as mini-displays or LED cues) rather than functioning as invisible, silent "black-box" data loggers requiring a separate smartphone or computer screen.

Finally, Patel et al. [12] reviewed emerging Internet-of-Things (IoT) architectures for decentralized patient monitoring, emphasizing that modern tele-rehabilitation systems must balance edge computation on low-power microcontrollers (such as the ESP32) with asynchronous telemetry transmission to modular web interfaces to preserve battery autonomy.

## 2.3 Critical Comparative Analysis
To systematically evaluate the state of the art and clearly delineate the technological contribution of the NeuroSense system, a critical comparative analysis across six representative commercial and academic systems is summarized in Table 2.1.

### Table 2.1: Critical Comparative Analysis of Glove-Based Biomechanical Systems
| Parameter / Feature | CyberGlove III [9] | 5DT Data Glove 14 [2] | Popovic et al. [3] | Leap Motion [7] | IMU-Only Glove [5] | Proposed NeuroSense System |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Transduction** | Piezoresistive strain gages | Optical fiber loop attenuation | Force Sensitive Resistors (FSR) | Optical Infrared Stereo Tracking | 16x MEMS IMU Sensor Array | **5x Flex + 1x FSR + 1x 6-DOF IMU** |
| **Finger Flexion Tracking** | Yes (18-22 joints) | Yes (14 joints) | No | Yes (Markerless visual tracking) | Yes (Derived via kinematics) | **Yes (5 discrete digits, 0°-90°)** |
| **Tactile Contact Force** | No | No | Yes (Fingertips & palm) | No | No | **Yes (Palmar grip load up to 1000 gf)** |
| **Spatial Hand Orientation** | Optional external tracker | No | No | Limited to optical FOV | Yes (Full 3D skeletal posture) | **Yes (On-board MPU6050 pitch & roll)** |
| **Line-of-Sight Occlusion** | Immune | Immune | Immune | Severe occlusion during grasp | Immune | **Immune (Direct contact sensing)** |
| **On-Device Standalone Display**| None (Requires PC) | None (Requires PC) | None (Bench DAQ) | None (Requires PC screen) | None (External host required) | **Yes (On-board I2C OLED display)** |
| **Power Management** | Tethered / Battery pack | Tethered USB / BT | Laboratory bench supply | USB powered from host PC | External LiPo battery | **Integrated TP4056 + 5V Boost rail** |
| **Modular Companion Dashboard**| Proprietary PC software | Proprietary SDK | LabVIEW desktop script | Proprietary visualizer | Custom Python script | **Web-based FastAPI + React Dashboard** |
| **Patient Session Archival** | Proprietary binary format | Text log via SDK | Manual CSV save | None | Custom raw log | **SQLite session storage + CSV export** |
| **Approximate System Cost** | $\$8,000 - \$15,000$ | $\$2,500 - \$4,000$ | $\$400$ (Custom lab) | $\$150$ (Camera only) | $\$350$ (Custom lab) | **< $\$45$ (Accessible open-source)** |

## 2.4 Research Gap and Problem Formulation
The systematic literature survey reveals significant technological and economic gaps in existing hand monitoring solutions:
1. **The Disconnect Between Kinematics and Kinetics:** Commercial datagloves focus exclusively on kinematic angular displacement, neglecting tactile grasp force. Conversely, tactile force arrays ignore finger joint articulation. In functional rehabilitation, recovery of grasp force is inextricably linked to joint flexion; monitoring one without the other yields an incomplete clinical picture.
2. **Prohibitive Commercial Cost & Proprietary Lock-In:** Systems such as the CyberGlove and 5DT Data Glove are priced between $\$2,500$ and $\$15,000$, restricting their utilization to elite clinical research institutes and precluding widespread home adoption by individual patients.
3. **Absence of Standalone Local Feedback:** Existing academic prototypes operate as passive sensors, requiring continuous physical or wireless tethering to a running desktop computer or high-end tablet. Patients cannot simply strap on the device and perform exercises with immediate visual confirmation of joint movement unless an external screen is configured and active.
4. **Lack of an Open, Modular Tele-Rehabilitation Companion:** While some research groups implement rudimentary Python or LabVIEW scripts, they lack modern, responsive web-based dashboards that cleanly decouple real-time hardware acquisition from clinical session recording, historical database archival, and structured CSV export.
5. **Absence of Low-Cost, Regulated Rechargeable Power Architecture:** Many microcontroller-based prototypes run on non-rechargeable 9V alkaline batteries through lossy linear regulators or attempt to power 5V microcontroller rails directly from unregulated 3.7V Li-ion cells, resulting in unstable ADC references and frequent device resets.

### Problem Formulation
To overcome these identified deficiencies, the **NeuroSense** system is formulated as a self-contained, low-cost wearable sensing glove integrating five flex sensors, a palmar FSR, an MPU6050 6-DOF IMU, an on-device OLED display, and a dedicated TP4056-boosted rechargeable power architecture, coupled asynchronously with an auxiliary web-based session recording dashboard to provide comprehensive, quantitative tele-rehabilitation monitoring.

---

### Chapter Summary
Chapter 2 reviewed the biomechanical sensing literature across resistive, optical, inertial, and computer-vision methodologies. It established a detailed comparative taxonomy demonstrating the trade-offs of existing commercial and research gloves, and formalized the specific research gap in multi-modal, cost-effective, standalone wearable sensing that the NeuroSense architecture directly addresses.

### Outline of Next Chapter
Chapter 3 presents the mathematical background, transduction physics, and engineering design of the NeuroSense system. It derives the governing mathematical equations for flex sensors, FSRs, and IMU complementary filtering, details the circuit and power subsystem design, and provides comprehensive flowcharts illustrating both embedded acquisition and auxiliary session recording.
