# Chapter 3: Mathematical Background, Logical Thinking & Project Design

> **This chapter establishes the fundamental transduction physics, mathematical modeling, and engineering design principles underlying the NeuroSense wearable system. It details the governing equations for piezoresistive flex sensing, quantum tunneling FSR response, and IMU inertial complementary filter fusion. Furthermore, it outlines the electrical circuit schematics, the TP4056-boosted power architecture, and provides rigorous system block diagrams and operational flowcharts.**

## 3.1 Introduction
The design of an accurate, wearable biomechanical instrumentation system demands a rigorous synthesis of mechanical sensing physics, analog signal conditioning, embedded digital sampling, and deterministic mathematical modeling. In the NeuroSense architecture, electrical signals originate from analog physical transducers subject to continuous human articulation. To translate continuous physical deformations into stable, calibrated engineering metrics, each transducer must be mathematically modeled and properly conditioned before analog-to-digital conversion by the ESP32 microcontroller.

Crucially, the system architecture establishes a distinct functional boundary:
1. **The Embedded Wearable Core:** Operates as a self-contained, real-time deterministic computing node responsible for sensor excitation, analog digitization, digital filtering, on-device visual telemetry via an OLED screen, and safety monitoring.
2. **The Rechargeable Power Subsystem:** Provides a regulated, low-noise power distribution network that decouples fluctuating battery terminal voltages from sensitive analog references.
3. **The Auxiliary Companion Suite (Dashboard):** Operates asynchronously on an external workstation, receiving serialized telemetry packets for real-time visualization, biomechanical session logging, and CSV archival without impeding the primary wearable control loop.

## 3.2 Sensor Working Principles & Mathematical Models

### 3.2.1 Flex Sensor Working Principle & Divider Model
A flex sensor is a flexible, thin-film piezoresistive transducer composed of a flexible polyimide substrate coated with a micro-segmented conductive carbon ink layer. When the sensor is in a flat, planar state ($0^\circ$ deflection), the conductive carbon particles are in uniform physical contact, exhibiting a baseline nominal electrical resistance denoted as $R_0$ (typically between $10\text{ k}\Omega$ and $25\text{ k}\Omega$).

When the sensor is bent along its longitudinal axis around a finger joint, the outer radius experiences tensile mechanical strain. This tensile strain induces microscopic separations (micro-cracks) between adjacent carbon particles, elongating the effective conduction path and reducing the cross-sectional contact area:

```
   Flat State (0° Deflection):
   [=== Carbon Particles in Dense Contact ===] ---> Low Resistance (R0 ≈ 10-25 kΩ)

   Bent State (Tensile Strain):
   [= = = Micro-Cracks / Particle Gaps = = =]  ---> High Resistance (R_flex > R0)
```

To first-order approximation within the physiological range of finger flexion ($0^\circ \le \theta \le 90^\circ$), the change in sensor resistance $\Delta R_{flex}$ is monotonically related to the bending angle $\theta$ by:
$$R_{flex}(\theta) = R_0 + k_f \cdot \theta$$
where:
- $R_0$ is the unbent nominal resistance at $\theta = 0^\circ$ (typically $\approx 12.5\text{ k}\Omega$).
- $k_f$ is the angular sensitivity coefficient (typically $\approx 250\text{--}350\ \Omega/^\circ$).
- $\theta$ is the angular deflection in degrees.

To convert this variable resistance into a measurable analog voltage compatible with the ESP32 microcontroller, each flex sensor is configured in a non-inverting voltage divider network with a high-stability metal-film fixed resistor $R_{fixed}$:

```
          V_CC (3.3V Regulated)
               |
             +---+
             |   |  R_flex (Bend Sensor)
             |   |
             +---+
               |
               +--------> V_out (To ESP32 ADC Pin)
               |
             +---+
             |   |  R_fixed (10 kΩ Metal Film)
             |   |
             +---+
               |
              GND (Common Ground)
```

Applying Kirchhoff's Voltage Law to the voltage divider network, the instantaneous output voltage $V_{out}(\theta)$ presented to the microcontroller ADC is given by:
$$V_{out}(\theta) = V_{CC} \cdot \left( \frac{R_{fixed}}{R_{fixed} + R_{flex}(\theta)} \right)$$

Substituting the linear angular resistance equation into the transfer function yields:
$$V_{out}(\theta) = V_{CC} \cdot \left( \frac{R_{fixed}}{R_{fixed} + R_0 + k_f \cdot \theta} \right)$$

As the finger bends, $\theta$ increases, causing $R_{flex}$ to rise, which in turn causes the output voltage $V_{out}$ across the fixed pull-down resistor to decrease monotonically. To maximize the dynamic voltage swing $\Delta V_{out} = V_{out}(0^\circ) - V_{out}(90^\circ)$ across the expected resistance range, the fixed resistor value is selected to match the geometric mean of the sensor's boundary resistances:
$$R_{fixed} \approx \sqrt{R_{min} \cdot R_{max}} = \sqrt{10\text{ k}\Omega \cdot 40\text{ k}\Omega} = 20\text{ k}\Omega$$
In our hardware prototype, a standard precision metal-film resistor of $R_{fixed} = 10\text{ k}\Omega$ ($1\%$ tolerance) was selected, ensuring an optimal signal-to-noise ratio and a broad dynamic voltage swing spanning $0.85\text{ V}$ to $2.20\text{ V}$.

The ESP32 microcontroller utilizes a successive-approximation register (SAR) Analog-to-Digital Converter with $N = 12$ bits of resolution, corresponding to $2^{12} = 4096$ discrete quantization levels ($0$ to $4095$). With the input attenuation configured to $11\text{ dB}$ (full-scale input voltage $V_{ref} = 3.3\text{ V}$), the idealized quantized integer ADC output is modeled as:
$$ADC_{raw}(\theta) = \left\lfloor \frac{V_{out}(\theta)}{V_{ref}} \cdot (2^N - 1) \right\rfloor = \left\lfloor \frac{V_{out}(\theta)}{3.3} \cdot 4095 \right\rfloor$$

### 3.2.2 Force Sensitive Resistor (FSR) Transduction
The Force Sensitive Resistor (FSR) is a piezoresistive polymer thick-film (PTF) sensor engineered to detect mechanical compressive force applied normal to its active surface. The active sensing area consists of interdigitated conductive metallic traces printed on a flexible dielectric substrate, separated from a semiconductor polymer layer containing microscopic conductive nanoparticles.

Under zero applied external force ($F = 0$), the semiconductor layer rests lightly above the interdigitated traces, separated by microscopic air gaps and surface asperities. Consequently, the sensor exhibits an open-circuit stand-off resistance exceeding $10\text{ M}\Omega$.

When an external compressive load $F$ is applied (such as when grasping an object with the palm), two physical phenomena occur simultaneously:
1. **Mechanical Micro-Contact Area Expansion:** The elastomeric substrate deforms elastically, forcing an increasing number of conductive polymer peaks into direct contact with the interdigitated metallic fingers.
2. **Quantum Mechanical Tunneling Conduction:** At the microscopic scale, the distance between adjacent conductive nanoparticles within the polymer matrix decreases. Electrons traverse the inter-particle potential barrier via quantum tunneling, drastically increasing overall electrical conductance.

Empirically, the electrical conductance $G_{FSR} = 1/R_{FSR}$ of an FSR is governed by a power-law relationship with respect to the applied force $F$:
$$G_{FSR}(F) = \frac{1}{R_{FSR}(F)} = K_p \cdot F^\gamma$$
where:
- $K_p$ is a dimensional scaling constant dependent on sensor geometry and material composition.
- $\gamma$ is the power-law exponent (typically $0.85 \le \gamma \le 1.15$ for standard commercial PTF sensors).
- $F$ is the applied normal compressive force in Newtons or gram-force (gf).

Within a non-inverting voltage divider driven by $V_{CC} = 3.3\text{ V}$ with a fixed pull-down resistor $R_{F\_fixed} = 10\text{ k}\Omega$, the output voltage $V_{FSR}(F)$ is:
$$V_{FSR}(F) = V_{CC} \cdot \left( \frac{R_{F\_fixed}}{R_{F\_fixed} + R_{FSR}(F)} \right)$$

Expressing this relationship in terms of electrical conductance $G_{FSR}$:
$$V_{FSR}(F) = V_{CC} \cdot \left( \frac{R_{F\_fixed} \cdot G_{FSR}(F)}{1 + R_{F\_fixed} \cdot G_{FSR}(F)} \right) \approx V_{CC} \cdot R_{F\_fixed} \cdot K_p \cdot F^\gamma \quad \text{(for small loads where } R_{FSR} \gg R_{F\_fixed}\text{)}$$

At light to moderate functional grasp forces ($50\text{--}500\text{ gf}$), the output voltage increases in near-linear proportionality to the applied load, providing an excellent sensitivity window for detecting palmar grasp initiation, object stabilization, and peak squeeze force.

### 3.2.3 MPU6050 6-DOF IMU Kinematics & Complementary Filter
The MPU6050 integrates a 3-axis MEMS capacitive accelerometer and a 3-axis vibrating ring rate gyroscope within a single silicon package, communicating with the ESP32 over an I2C serial interface at $400\text{ kHz}$.

#### Accelerometer Kinematic Model
The 3-axis accelerometer measures specific force (linear acceleration minus gravitational acceleration) along the orthogonal sensor axes $X$, $Y$, and $Z$:
$$\vec{a} = \begin{bmatrix} a_x & a_y & a_z \end{bmatrix}^T$$
Under quasi-static conditions (where hand translational acceleration is small compared to gravity, $|\vec{a}_{trans}| \ll g$), the accelerometer output is dominated by the static gravitational acceleration vector $\vec{g} \approx 9.81\text{ m/s}^2$. The spatial roll angle $\phi_{acc}$ (rotation about the X-axis) and pitch angle $\theta_{acc}$ (rotation about the Y-axis) can be computed using trigonometric inverse-tangent formulations:
$$\phi_{acc} = \arctan2\left(a_y, \sqrt{a_x^2 + a_z^2}\right) \cdot \frac{180^\circ}{\pi}$$
$$\theta_{acc} = \arctan2\left(-a_x, \sqrt{a_y^2 + a_z^2}\right) \cdot \frac{180^\circ}{\pi}$$

While the accelerometer provides an absolute, drift-free angular reference relative to the Earth's gravity vector, its output is highly susceptible to high-frequency mechanical vibrations, tremors, and sudden translational hand movements, introducing significant short-term dynamic noise.

#### Gyroscope Dynamic Model
The 3-axis rate gyroscope measures instantaneous angular velocities:
$$\vec{\omega} = \begin{bmatrix} \omega_x & \omega_y & \omega_z \end{bmatrix}^T \quad (\text{in } ^\circ/\text{s})$$
The pitch angle can be tracked dynamically by numerical integration of the pitch rate $\omega_y$ over discrete sampling time intervals $\Delta t$:
$$\theta_{gyro}(t) = \theta(t - \Delta t) + (\omega_y(t) - \omega_{bias}) \cdot \Delta t$$

The rate gyroscope provides exceptional dynamic fidelity, remaining entirely immune to external translational shocks. However, real-world MEMS gyroscopes suffer from finite DC bias offsets $\omega_{bias}$. When integrated continuously over time, even microscopic bias errors accumulate indefinitely, causing severe low-frequency angular drift:
$$\lim_{t \to \infty} \int_0^t \omega_{bias} \, d\tau = \pm \infty$$

#### Complementary Filter Sensor Fusion
To overcome the high-frequency vulnerability of the accelerometer and the low-frequency drift of the gyroscope, a digital **Complementary Filter** is implemented in the embedded firmware. The complementary filter fuses the two frequency-complementary signals using a first-order low-pass filter on the accelerometer and a high-pass filter on the integrated gyroscope:

```
       Gyroscope Rate (ω_y) ----> [Integrator (dt)] ----> [High-Pass Filter (α)] ---+
                                                                                     |
                                                                                     v
                                                                                   (+) ---> Fused Pitch Angle (θ_fused)
                                                                                     ^
                                                                                     |
       Accel Vectors (a_x,y,z) --> [Trig Atan2 (θ_acc)] -> [Low-Pass Filter (1-α)] --+
```

Mathematically, the recursive discrete-time update equation for the fused pitch angle $\theta_{fused}(t)$ is formulated as:
$$\theta_{fused}(t) = \alpha \cdot \left[ \theta_{fused}(t - \Delta t) + \omega_y(t) \cdot \Delta t \right] + (1 - \alpha) \cdot \theta_{acc}(t)$$
Similarly, the fused roll angle $\phi_{fused}(t)$ is computed as:
$$\phi_{fused}(t) = \alpha \cdot \left[ \phi_{fused}(t - \Delta t) + \omega_x(t) \cdot \Delta t \right] + (1 - \alpha) \cdot \phi_{acc}(t)$$

where $\alpha$ is the filter weighting coefficient determined by the desired filter cutoff frequency $f_c$ and the sampling period $\Delta t = 0.02\text{ s}$ ($50\text{ Hz}$):
$$\alpha = \frac{\tau}{\tau + \Delta t} = \frac{1}{1 + 2\pi f_c \Delta t}$$
Setting the time constant $\tau = 0.5\text{ s}$ ($f_c \approx 0.32\text{ Hz}$) yields an optimal filter coefficient of:
$$\alpha = \frac{0.5}{0.5 + 0.02} \approx 0.96$$

This weighting allocates $96\%$ of the instantaneous update to the high-frequency gyroscope integration (ensuring snappy, jitter-free dynamic tracking) while utilizing $4\%$ of the static accelerometer gravity vector to continuously nullify and clamp any cumulative gyroscopic DC drift.

## 3.3 Hardware Circuit & Power Subsystem Design

### 3.3.1 ESP32 Microcontroller & ADC Pin Configuration
The core computing node of the NeuroSense hardware is the ESP32 DevKit, powered by a 32-bit dual-core Tensilica Xtensa LX6 microprocessor operating at $240\text{ MHz}$ with $520\text{ KB}$ of internal SRAM and integrated $2.4\text{ GHz}$ Wi-Fi ($802.11\text{ b/g/n}$) and Bluetooth v4.2 BR/EDR & BLE.

The ESP32 features two 12-bit SAR ADCs: ADC1 (supporting 8 input channels across GPIO 32–39) and ADC2 (supporting 10 input channels across GPIO 0, 2, 4, 12–15, 25–27). A critical engineering constraint of the ESP32 is that **ADC2 channels cannot be utilized when the Wi-Fi subsystem is active**, as the Wi-Fi radio driver preempts ADC2 analog peripheral registers.

To ensure complete hardware compatibility across both USB serial operation and active Wi-Fi telemetry streaming, all primary analog channels were allocated with careful regard to internal ADC grouping. Table 3.1 details the complete hardware pin allocation for the NeuroSense prototype.

### Table 3.1: ESP32 Hardware Pin Allocation for NeuroSense Wearable Prototype
| Physical Sensor Channel | Sensor Type | Target Anatomical Joint | ESP32 GPIO | ADC Channel / Bus | Circuit Interface Topology |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **fsr_palm** | Force Sensitive Resistor | Palmar / Thenar Grasp Nexus | **GPIO 33** | ADC1_CH5 | 10 kΩ Pull-Down Divider to GND |
| **flex_thumb** | 2.2" Flex Sensor | Thumb Interphalangeal Joint | **GPIO 25** | ADC2_CH8 / ADC1 | 10 kΩ Pull-Down Divider to GND |
| **flex_index** | 2.2" Flex Sensor | Index Proximal Interphalangeal | **GPIO 26** | ADC2_CH9 / ADC1 | 10 kΩ Pull-Down Divider to GND |
| **flex_middle** | 2.2" Flex Sensor | Middle Proximal Interphalangeal| **GPIO 27** | ADC2_CH7 | 10 kΩ Pull-Down Divider to GND |
| **flex_ring** | 2.2" Flex Sensor | Ring Proximal Interphalangeal | **GPIO 14** | ADC2_CH6 | 10 kΩ Pull-Down Divider to GND |
| **flex_pinky** | 2.2" Flex Sensor | Pinky Proximal Interphalangeal| **GPIO 12** | ADC2_CH5 | 10 kΩ Pull-Down Divider to GND |
| **MPU6050 SDA** | 6-DOF IMU Data Line | Dorsal Carpal Surface | **GPIO 21** | I2C Data (SDA) | 4.7 kΩ Pull-Up to 3.3V |
| **MPU6050 SCL** | 6-DOF IMU Clock Line| Dorsal Carpal Surface | **GPIO 22** | I2C Clock (SCL)| 4.7 kΩ Pull-Up to 3.3V |
| **OLED Display** | 0.96" I2C Display | Forearm / Dorsal Hand Mount | **GPIO 21/22**| Shared I2C Bus | Shared SDA/SCL (Addr: 0x3C) |

### 3.3.2 Rechargeable Power Path: TP4056 & 5V Step-Up Booster
A major flaw in many DIY wearable prototypes is the reliance on tethered USB cables or unregulated battery connections. A standard single-cell Lithium-ion / Lithium-Polymer (LiPo) battery exhibits a terminal voltage that varies dynamically between $4.2\text{ V}$ (at full charge) down to $3.0\text{ V}$ (at full discharge), with a nominal plateau at $3.7\text{ V}$.

The on-board low-dropout (LDO) voltage regulator on the ESP32 DevKit (typically an AMS1117-3.3 or ME6211) requires a minimum input voltage of $V_{in} \ge 3.3\text{ V} + V_{dropout} \approx 4.4\text{ V}$ to deliver a stable $3.3\text{ V}$ internal system rail. Connecting a $3.7\text{ V}$ battery directly to the ESP32 $5\text{V/VIN}$ pin causes the LDO regulator to drop out of regulation as the battery drains below $4.4\text{ V}$, inducing unstable ADC reference voltages, brown-out resets, and Wi-Fi transmission crashes.

To establish an autonomous, safe, and electrically stable power supply, NeuroSense incorporates a multi-stage power conditioning architecture:

```
   +-----------------------------------------------------------------------------------+
   |                            RECHARGEABLE POWER SUBSYSTEM                           |
   |                                                                                   |
   |   [USB-C 5V Input]                                                                |
   |          |                                                                        |
   |          v                                                                        |
   |   +--------------+      +------------------+      +---------------+      +-----+  |
   |   | TP4056 Board | ---> | Li-ion 3.7V Cell | ---> | MT3608 Boost  | ---> |ESP32|  |
   |   | (CC/CV 1A +  | B+/B-| (1200 mAh Pack)  | OUT+ | (Regulated    | 5.0V | VIN |  |
   |   |  DW01A Prot) |      +------------------+ OUT- |  5.02V Rail)  |      +-----+  |
   |   +--------------+                                +---------------+         |     |
   |          |                                                |                 |     |
   |          +==================== COMMON GROUND =============+=================+     |
   +-----------------------------------------------------------------------------------+
```

The power architecture operates as follows:
1. **TP4056 Linear Charging Controller:** Accepts a $5\text{ V}$ input via a standard USB-C port, implementing a precise constant-current / constant-voltage (CC/CV) charging cycle for single-cell Li-ion batteries at a pre-set charging current of $1000\text{ mA}$ ($1\text{A}$).
2. **Integrated Battery Protection (DW01A + FS8205A Dual MOSFET):** Provides critical battery safety safeguards:
   - **Overcharge Protection:** Terminates charging if cell voltage exceeds $4.28\text{ V} \pm 0.05\text{ V}$.
   - **Over-discharge Cutoff:** Disconnects the load if cell voltage drops below $2.40\text{ V} \pm 0.1\text{ V}$, preventing irreversible chemical degradation of the lithium cell.
   - **Overcurrent / Short-Circuit Protection:** Clamps output current if load exceeds $3.0\text{ A}$.
3. **High-Efficiency Step-Up DC-DC Boost Converter (MT3608):** Takes the battery voltage ($3.0\text{ V}$ to $4.2\text{ V}$) and steps it up via high-frequency pulse-width modulation ($1.2\text{ MHz}$ switching frequency) to a regulated $5.02\text{ V} \pm 0.02\text{ V}$ rail feeding the ESP32 $5\text{V/VIN}$ pin.
4. **Common Ground Plane:** All ground terminals (Battery B-, TP4056 OUT-, Boost GND, and ESP32 GND) are bonded to a low-impedance star ground to eliminate ground loops and minimize ADC measurement offset errors.

### Table 3.2: Power Subsystem Component Specifications and Operating Parameters
| Subsystem Stage | Component / Model | Input Parameter | Output Parameter | Efficiency / Rating |
| :--- | :--- | :--- | :--- | :--- |
| **Battery Cell** | 18650 / LiPo Single-Cell | Recharges via TP4056 | $3.7\text{ V Nominal (3.0V - 4.2V)}$ | $1200\text{ mAh Capacity}$ |
| **Battery Charger** | TP4056 Module with Protection | $5.0\text{ V DC (USB-C)}$ | $4.20\text{ V CC/CV Cutoff}$ | $I_{chg} = 1.0\text{ A (1000 mA)}$ |
| **Safety Circuit** | DW01A + 8205A MOSFET | Battery Terminals | $2.4\text{ V Cutoff / 3A Clamp}$ | Quiescent Current $< 3\ \mu\text{A}$ |
| **DC-DC Step-Up** | MT3608 Boost Converter | $3.0\text{ V - 4.2\text{ V}}$ | **$5.02\text{ V Regulated DC}$** | $\eta \approx 88\text{--}92\%$, Max $2\text{ A}$ |
| **System Load Rail**| ESP32 DevKit VIN Pin | $5.02\text{ V Boosted Rail}$ | $3.3\text{ V System Rail (via LDO)}$ | $I_{active} \approx 160\text{--}240\text{ mA}$ |

#### Power Budget & Battery Autonomy Calculation
The continuous power consumption of the wearable system during active acquisition and data transmission is modeled as:
$$P_{total} = P_{ESP32} + P_{sensors} + P_{IMU} + P_{OLED}$$
- ESP32 Core + Active Sampling + Wi-Fi Telemetry: $I_{ESP32} \approx 180\text{ mA}$ at $3.3\text{ V} \implies P_{ESP32} \approx 594\text{ mW}$.
- Voltage Dividers (5 Flex + 1 FSR at avg $20\text{ k}\Omega$): $I_{div} = 6 \times \frac{3.3\text{ V}}{20\text{ k}\Omega + 10\text{ k}\Omega} \approx 0.66\text{ mA} \implies P_{sensors} \approx 2.2\text{ mW}$.
- MPU6050 Active Mode: $I_{IMU} \approx 3.8\text{ mA}$ at $3.3\text{ V} \implies P_{IMU} \approx 12.5\text{ mW}$.
- 0.96" I2C OLED Display: $I_{OLED} \approx 20\text{ mA}$ at $3.3\text{ V} \implies P_{OLED} \approx 66\text{ mW}$.
- Total System Power: $P_{total} \approx 675\text{ mW} = 0.675\text{ W}$.

Accounting for the efficiency of the internal LDO regulator ($\eta_{LDO} \approx 3.3/5.02 = 65.7\%$) and the efficiency of the MT3608 boost converter ($\eta_{boost} \approx 88\%$), the effective electrical current drawn from the $3.7\text{ V}$ battery is:
$$I_{batt} = \frac{P_{total}}{\eta_{LDO} \cdot \eta_{boost} \cdot V_{batt\_nom}} = \frac{0.675\text{ W}}{0.657 \cdot 0.88 \cdot 3.7\text{ V}} \approx 315\text{ mA}$$

The expected continuous operating battery autonomy $T_{runtime}$ for a $1200\text{ mAh}$ cell operating at an $85\%$ depth of discharge (DoD) is:
$$T_{runtime} = \frac{C_{battery} \cdot \text{DoD}}{I_{batt}} = \frac{1200\text{ mAh} \cdot 0.85}{315\text{ mA}} \approx 3.24\text{ hours (Continuous Wi-Fi)}$$
When operating over standard USB Serial with the Wi-Fi radio powered down ($I_{ESP32} \approx 60\text{ mA}$), battery autonomy extends to **over $7.5\text{ hours}$**, providing ample capacity for full-day clinical and domestic exercise sessions.

## 3.4 System Block Diagram & Flowcharts

### 3.4.1 System Block Diagram
Figure 3.6 depicts the detailed architectural block diagram of the NeuroSense system, illustrating the structural segregation between the standalone wearable core and the auxiliary session recording dashboard.

```
+==================================================================================================+
|                                    NEUROSENSE SYSTEM ARCHITECTURE                                |
+==================================================================================================+

  [ WEARABLE SENSING LAYER ]
  +----------------------------------------------------------------------------------------------+
  |  - 5x Flex Bend Sensors (Thumb, Index, Middle, Ring, Pinky) ---> [Precision Divider Array]   |
  |  - 1x Force Sensitive Resistor (Palmar Contact Zone) ---------> [Precision Divider Array]   |
  |  - 1x MPU6050 6-DOF IMU (Accelerometer + Gyroscope) ----------> [I2C Serial Bus @ 400 kHz]  |
  +----------------------------------------------------------------------------------------------+
                                                |
                                                | Analog Voltages (0-3.3V) & I2C Data
                                                v
  [ EMBEDDED CONTROLLER LAYER (ESP32 DevKit Core) ]
  +----------------------------------------------------------------------------------------------+
  |  +---------------------------+   +----------------------------+   +-----------------------+  |
  |  | 12-bit ADC Multi-Channel  |-->| 4-Sample Moving Average    |-->| Kinematic Angular &   |  |
  |  | Acquisition (11dB Atten)  |   | Digital Noise Filter       |   | Calibration Mapping   |  |
  |  +---------------------------+   +----------------------------+   +-----------------------+  |
  |                                                |                                             |
  |                                                v                                             |
  |  +----------------------------------------------------------------------------------------+  |
  |  | Dynamic JSON Telemetry Serialization Engine (50 Hz Acquisition / 20 ms Sampling Cycle) |  |
  |  +----------------------------------------------------------------------------------------+  |
  +----------------------------------------------------------------------------------------------+
            |                                                      |
            | Local Display Data (I2C)                             | High-Speed Telemetry
            v                                                      v (USB Serial COM / Wi-Fi POST)
  [ ON-DEVICE LOCAL DISPLAY ]                            [ AUXILIARY COMPANION SUITE (DASHBOARD) ]
  +------------------------------------+                 +---------------------------------------+
  | - 0.96" I2C OLED Display Module    |                 |  * Peripheral Tele-Rehabilitation     |
  | - Standalone Patient Biofeedback   |                 |    Session Logging & Analytics Suite  |
  | - Instantaneous Bend & Grip Status |                 |  - FastAPI Local Web Server (Python)  |
  | - Zero Dependency on External PC   |                 |  - React 19 / Tailwind Dark Dashboard |
  +------------------------------------+                 |  - 2D Anatomical Sensor Heatmap       |
                                                         |  - Real-Time Multi-Channel Waves      |
  [ PORTABLE RECHARGEABLE POWER LAYER ]                  |  - SQLite Session Archival Database   |
  +------------------------------------+                 |  - Clinical CSV Telemetry Export      |
  | - 3.7V 1200mAh Li-ion Battery      |                 +---------------------------------------+
  | - TP4056 1A CC/CV Charger + DW01A  |
  | - MT3608 5V Regulated Boost Rail   |
  +------------------------------------+
+==================================================================================================+
```

### 3.4.2 Embedded Firmware Acquisition Flowchart
Figure 3.7 illustrates the real-time operational state machine executed autonomously by the ESP32 microcontroller firmware.

```
                                  [ POWER ON / SYSTEM RESET ]
                                               |
                                               v
                             [ Initialize Hardware Peripherals ]
                             - Configure Serial UART (115200 baud)
                             - Initialize I2C Bus (SDA:21, SCL:22 @ 400kHz)
                             - Set ADC Resolution (12-bit, 0-4095)
                             - Set Channel Attenuation (ADC_11db, 0-3.3V)
                             - Initialize OLED Display & Render Splash
                                               |
                                               v
                             [ Check Connectivity & Startup Mode ]
                             - Attempt Wi-Fi Connection (Timeout: 10s)
                             - Set Telemetry Flag (USB Serial or Wi-Fi)
                                               |
                                               +<--------------------------------------+
                                               |                                       |
                                               v                                       |
                             [ Check Acquisition Timer (t >= 20ms) ]                   |
                                               |                                       |
                         +---------------------+---------------------+                 |
                         | YES                                       | NO              |
                         v                                           v                 |
          [ Read Analog Divider Channels ]             [ Maintain Background Tasks ]   |
          - Sample GPIO 33 (FSR Palm)                  - Handle Background Pings       |
          - Sample GPIO 25-27, 14, 12 (Flex 1-5)       - Yield CPU Execution           |
          - Execute 4-Sample Moving Average Filter                   |                 |
                         |                                           +-----------------+
                         v                                           |
          [ Read MPU6050 Motion Vectors ]                            |
          - Acquire Ax, Ay, Az (Accelerometer)                       |
          - Acquire Gx, Gy, Gz (Gyroscope)                           |
          - Execute Complementary Filter (Pitch/Roll)                |
                         |                                           |
                         v                                           |
          [ Update On-Device OLED Local Display ]                    |
          - Draw Flexion Status Bars (Thumb to Pinky)                |
          - Render Grip Load Indicator (FSR State)                   |
          - Display Battery Rail & System Status                     |
                         |                                           |
                         v                                           |
          [ Package & Transmit Telemetry Frame ]                     |
          - Build JSON Object (Timestamp, Raw & Calibrated ADC)      |
          - Transmit over Active Channel (Serial / HTTP POST)        |
                         |                                           |
                         +-------------------------------------------+
```

### 3.4.3 Peripheral Session Recording Flowchart
Figure 3.8 depicts the asynchronous event flow executed by the auxiliary **NeuroSense Master Dashboard**, highlighting its specific role as an external telemetry visualizer and patient session recorder.

```
                              [ CLINICIAN LAUNCHES DASHBOARD ]
                             (FastAPI Server :8000 + React :5173)
                                               |
                                               v
                                [ Establish Telemetry Ingress ]
                                               |
                      +------------------------+------------------------+
                      | Hardware Mode                                   | Simulator Mode
                      v                                                 v
         [ Open Serial COM Port / HTTP ]                  [ Activate Biomechanical Engine ]
         - Receive 50 Hz JSON Frames                      - Synthesize Calibrated Flex & FSR
         - Parse Raw & Calibrated Readings                - 20 Hz Frame Rate Generator
                      |                                                 |
                      +------------------------+------------------------+
                                               |
                                               v
                             [ Real-Time Telemetry Processing ]
                             - Compute Dynamic Signal-to-Noise Ratio (SNR)
                             - Normalize ADC to Joint Flexion Percentage (0-100%)
                             - Update 2D Anatomical Hand Heatmap Joint Colors
                             - Append Values to 60-Frame Scrolling Graph Buffer
                                               |
                                               v
                             [ Session Recording State Machine ]
                                               |
                         +---------------------+---------------------+
                         | Clinician Clicks "Start Recording"        | Idle / Live Viewing
                         v                                           v
         [ Create Active Session in SQLite ]              [ Live Waveform Monitoring ]
         - Allocate UUID & Start Timestamp                - Update UI Elements
         - Buffer Telemetry Frames to Disk                - Log Diagnostic Events
         - Render Recording Duration Timer                           |
                         |                                           |
                         v                                           |
         [ Clinician Clicks "Stop Recording" ]                       |
         - Finalize Session Record in SQLite                         |
         - Calculate Summary Statistics (Peak, Mean)                 |
         - Enable One-Click "Export CSV" Download                    |
                         |                                           |
                         +-------------------------------------------+
```

---

### Chapter Summary
Chapter 3 established the scientific, mathematical, and circuit design foundations of the NeuroSense wearable system. It derived the governing analytical equations for flex sensor micro-cracking, quantum tunneling FSR response, and IMU complementary filtering. It detailed the pinout architecture of the ESP32, demonstrated the electrical stability of the TP4056-boosted power architecture, and provided comprehensive block diagrams and flowcharts distinguishing real-time embedded acquisition from modular session logging.

### Outline of Next Chapter
Chapter 4 details the practical implementation, hardware prototyping, and software development of the NeuroSense system. It documents the physical wearable glove fabrication, firmware programming, standalone OLED display integration, and provides an in-depth walkthrough of the auxiliary NeuroSense Master Dashboard interface.
