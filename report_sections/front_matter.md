# NEUROSENSE: WEARABLE SENSOR-BASED HAND MOVEMENT AND PRESSURE MONITORING SYSTEM

**A Mini Project Report Submitted in partial fulfillment of the requirements for the degree of**  
**Bachelor in Technology (Electronics and Telecommunication Engineering)**

**Department of Electronics and Telecommunication Engineering**  
**K. J. Somaiya School of Engineering**  
**Somaiya Vidyavihar University, Mumbai-77**  
**Batch 2024 - 2028 (Semester V)**

---

### Project Team
| Student Name | Roll Number |
| :--- | :--- |
| **Aakash Ijantkar** | 16010324018 |
| **Piyush Kalekar** | 16010324020 |
| **Diksha Khandge** | 16010324022 |
| **Mayank Pareek** | 16010324032 |

**Project Guides:**  
**Prof. Ruchira Jadhav / Dr. Vandana Satam**  
Department of Electronics and Telecommunication Engineering  
K. J. Somaiya School of Engineering, Somaiya Vidyavihar University, Mumbai-77

---

## Somaiya Vidyavihar University
### K J Somaiya School of Engineering
#### Certificate

This is to certify that the mini project report entitled **"NEUROSENSE: WEARABLE SENSOR-BASED HAND MOVEMENT AND PRESSURE MONITORING SYSTEM"** submitted by **Aakash Ijantkar (16010324018)**, **Piyush Kalekar (16010324020)**, **Diksha Khandge (16010324022)**, and **Mayank Pareek (16010324032)** at the end of Semester V of TY B. Tech is a bonafide record of work carried out under our guidance in partial fulfillment of the requirements for the degree of Bachelor in Technology in Electronics and Telecommunication Engineering of Somaiya Vidyavihar University.

_____________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _____________________  
**Guide / Internal Examiner** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **External Examiner**  
**Prof. Ruchira Jadhav / Dr. Vandana Satam**

Date: November 2026  
Place: Mumbai-77

---

## Somaiya Vidyavihar University
### K J Somaiya School of Engineering
#### Certificate of Approval of Examiners

This is to certify that the Mini Project Report entitled **"NEUROSENSE: WEARABLE SENSOR-BASED HAND MOVEMENT AND PRESSURE MONITORING SYSTEM"** is approved for the degree of Bachelor in Technology in Electronics and Telecommunication Engineering of Somaiya Vidyavihar University.

_____________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _____________________  
**Expert / External Examiner** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Internal Examiner / Guide**

Date: November 2026  
Place: Mumbai-77

---

## DECLARATION

We declare that this written report submission represents the work done based on our and / or others' ideas with adequately cited and referenced original sources. We also declare that we have adhered to all principles of intellectual property, academic honesty, and integrity, and that we have not misinterpreted or fabricated or falsified any idea/data/fact/source/original work in our submission.

We understand that any violation of the above will be cause for disciplinary action by the college and university and may evoke penal action from sources that have not been properly cited or from whom proper permission was not sought.

| Signature of the Student | Name & Roll Number |
| :--- | :--- |
| ___________________________ | **Aakash Ijantkar** (Roll No: 16010324018) |
| ___________________________ | **Piyush Kalekar** (Roll No: 16010324020) |
| ___________________________ | **Diksha Khandge** (Roll No: 16010324022) |
| ___________________________ | **Mayank Pareek** (Roll No: 16010324032) |

Date: November 2026  
Place: Mumbai-77

---

## Abstract

NeuroSense is an embedded wearable sensing glove system engineered for continuous, objective monitoring of hand articulation kinematics and palmar grip force during upper-limb neuro-rehabilitation and orthopedic recovery. Impairments of fine motor coordination and grasp strength resulting from ischemic stroke, traumatic brain injuries, cervical spinal cord damage, arthritis, or peripheral neuropathies are traditionally evaluated using subjective manual goniometers, mechanical Jamar dynamometers, or bulky optical motion capture suites. These legacy diagnostic modalities are labor-intensive, subject to intra- and inter-rater subjectivity, confined to specialized hospital environments, and incapable of capturing continuous functional dynamics during daily home exercises.

To overcome these barriers, the core NeuroSense prototype integrates an ergonomic wearable glove housing five flexible resistive bend sensors aligned along the individual finger digits (Thumb, Index, Middle, Ring, Pinky), a high-linearity Force Sensitive Resistor (FSR) positioned at the primary palmar grasp zone, and a 6-Degree-of-Freedom (6-DOF) MPU6050 Inertial Measurement Unit (IMU) positioned over the dorsal carpal surface. Analog signal conditioning is achieved via precision voltage divider networks interfacing with the 12-bit Analog-to-Digital Converter (ADC) channels of an ESP32 microcontroller, which executes on-board 4-sample moving average digital filtering, angular calibration, and real-time telemetry serialization. The standalone wearable prototype features an integrated on-device I2C OLED display providing immediate visual feedback directly to the patient without requiring an external computer, and is powered by a rechargeable 3.7V single-cell Lithium-ion battery backed by a TP4056 charging management controller and a regulated 5.0V DC-DC step-up boost converter.

As an additional, modular evaluation tool developed to assist clinicians, an auxiliary web-based **NeuroSense Master Dashboard** was engineered using a FastAPI backend and a modern React/Tailwind frontend. This companion software serves exclusively as a peripheral session recording and diagnostic inspection tool, featuring a 2D anatomical sensor heatmap, real-time multi-channel waveform streaming, sensor freshness diagnostics, and SQLite session logging with CSV export. Data processing operates deterministically on calibrated physical sensor characteristics without reliance on external machine learning datasets. Bench testing validates an acquisition sampling rate of 50 Hz, low signal transmission latency (<25 ms), high bend and force repeatability, and continuous battery autonomy of ~4.5 hours, demonstrating an affordable, reliable solution for decentralized tele-rehabilitation.

**Keywords:** Wearable Sensing, ESP32, Flex Sensors, Force Sensitive Resistor (FSR), MPU6050 IMU, TP4056 Boost Power Path, Embedded Telemetry, Patient Session Recording, Tele-Rehabilitation.

---

## Contents
- **Certificate** ..................................................................................................... ii
- **Certificate of Approval of Examiners** .................................................... iii
- **Declaration** .................................................................................................. iv
- **Abstract** ....................................................................................................... v
- **List of Figures** ............................................................................................ viii
- **List of Tables** ............................................................................................. ix
- **Nomenclature & Abbreviations** .............................................................. x

### Chapter 1: Introduction
- 1.1 Background ............................................................................................ 1
- 1.2 Motivation ............................................................................................... 3
- 1.3 Scope of the Project ................................................................................ 4
- 1.4 Objectives of the Project ........................................................................ 5
- 1.5 Brief Description of Project Undertaken ................................................. 6
- 1.6 Organization of the Report .................................................................... 7
- Chapter Summary & Outline of Next Chapter ............................................ 8

### Chapter 2: Literature Survey
- 2.1 Overview of Glove-Based Biomechanical Sensing .................................. 9
- 2.2 Review of Related Works ........................................................................ 10
- 2.3 Critical Comparative Analysis ................................................................ 13
- 2.4 Research Gap and Problem Formulation ................................................ 15
- Chapter Summary & Outline of Next Chapter ............................................ 16

### Chapter 3: Mathematical Background, Logical Thinking & Project Design
- 3.1 Introduction ............................................................................................ 17
- 3.2 Sensor Working Principles & Mathematical Models ............................... 17
  - 3.2.1 Flex Sensor Working Principle & Divider Model ......................... 17
  - 3.2.2 Force Sensitive Resistor (FSR) Transduction ............................. 20
  - 3.2.3 MPU6050 6-DOF IMU Kinematics & Complementary Filter ....... 22
- 3.3 Hardware Circuit & Power Subsystem Design ........................................ 25
  - 3.3.1 ESP32 Microcontroller & ADC Pin Configuration ..................... 25
  - 3.3.2 Rechargeable Power Path: TP4056 & 5V Step-Up Booster ......... 27
- 3.4 System Block Diagram & Flowcharts ....................................................... 29
  - 3.4.1 System Block Diagram ................................................................. 29
  - 3.4.2 Embedded Firmware Acquisition Flowchart ............................... 31
  - 3.4.3 Peripheral Session Recording Flowchart ...................................... 33
- Chapter Summary & Outline of Next Chapter ............................................ 34

### Chapter 4: Implementation and Experimentation
- 4.1 Wearable Glove Assembly & Sensor Integration .................................... 35
- 4.2 ESP32 Embedded Firmware Implementation .......................................... 37
- 4.3 On-Device Standalone Display Unit ....................................................... 39
- 4.4 Rechargeable Power Supply Implementation & Voltage Verification ...... 40
- 4.5 NeuroSense Master Dashboard: Modular Patient Session Logging ......... 41
  - 4.5.1 System Role & Design Philosophy .............................................. 41
  - 4.5.2 Dashboard Architecture & Telemetry Engine .............................. 42
  - 4.5.3 Interface Walkthrough & Visual Monitoring Suite ..................... 43
  - 4.5.4 Patient Session Recording & CSV Data Export ........................... 46
  - 4.5.5 Data Source Clarification & Hardware Connection Bridge ......... 47
- Chapter Summary & Outline of Next Chapter ............................................ 48

### Chapter 5: Results, Testing and Discussion
- 5.1 Experimental Setup & Testing Methodology .......................................... 49
- 5.2 Sensor Response Curves & Repeatability Analysis ................................. 50
- 5.3 IMU Dynamic Motion Tracking & Tilt Stability ...................................... 53
- 5.4 Sampling Rate, Telemetry Latency & Power Autonomy .......................... 54
- 5.5 Comparative Assessment: Standalone Wearable vs Dashboard Suite ..... 56
- Chapter Summary & Outline of Next Chapter ............................................ 57

### Chapter 6: Conclusions and Scope for Further Work
- 6.1 Conclusions ............................................................................................ 58
- 6.2 Scope for Future Work ............................................................................ 59
- Chapter Summary ......................................................................................... 60

### References / Bibliography ......................................................................... 61
### Appendix A: Pin Mapping and Component Specifications ...................... 64
### Appendix B: ESP32 Firmware Source Code .............................................. 66

---

## List of Figures
- Figure 3.1: Flex sensor conductive micro-crack mechanism during angular bending
- Figure 3.2: Voltage divider circuit configuration for flex and FSR sensors
- Figure 3.3: Force vs. Resistance characteristic curve of a typical FSR sensor
- Figure 3.4: Complementary filter block diagram fusing accelerometer and gyroscope signals
- Figure 3.5: Power subsystem schematic showing TP4056 Li-ion charger and 5V boost converter
- Figure 3.6: System Block Diagram of the NeuroSense Wearable Monitoring Architecture
- Figure 3.7: Flowchart of ESP32 Hardware Acquisition and Local Feedback Firmware
- Figure 3.8: Flowchart of Auxiliary Patient Session Recording and Dashboard Logging
- Figure 4.1: NeuroSense Master Dashboard Interface (Precision Lab Biomechanical Suite)
- Figure 5.1: Flex Sensor Output Voltage vs. Bending Angle (0° to 90°)
- Figure 5.2: FSR ADC Response vs. Applied Mechanical Load (0 to 1000 gf)
- Figure 5.3: Roll and Pitch angle response during rapid dynamic hand tilting

---

## List of Tables
- Table 2.1: Critical Comparative Analysis of Glove-Based Biomechanical Systems
- Table 3.1: ESP32 Hardware Pin Allocation for NeuroSense Wearable Prototype
- Table 3.2: Power Subsystem Component Specifications and Operating Parameters
- Table 4.1: Bill of Materials and Hardware Cost Breakdown for NeuroSense Prototype
- Table 4.2: NeuroSense Telemetry JSON Schema Specification
- Table 5.1: Flex Sensor Angular Calibration Data and Measured Output Characteristics
- Table 5.2: FSR Force Calibration Data under Standard Mechanical Deadweights
- Table 5.3: Power Consumption and Battery Autonomy across Operating Modes

---

## Nomenclature & Abbreviations

| Symbol / Abbreviation | Full Expansion |
| :--- | :--- |
| **ADC** | Analog-to-Digital Converter |
| **BOM** | Bill of Materials |
| **CC/CV** | Constant Current / Constant Voltage (Lithium Battery Charging Protocol) |
| **CSV** | Comma-Separated Values |
| **DOF** | Degrees of Freedom |
| **DW01A** | Lithium-ion Battery Protection Integrated Circuit |
| **ESP32** | 32-bit Dual-Core Tensilica Xtensa Microcontroller with Wi-Fi & Bluetooth |
| **EXTC** | Electronics and Telecommunication Engineering |
| **FSR** | Force Sensitive Resistor |
| **GPIO** | General Purpose Input / Output |
| **I2C** | Inter-Integrated Circuit Serial Bus Protocol |
| **IMU** | Inertial Measurement Unit |
| **JSON** | JavaScript Object Notation |
| **Li-ion** | Lithium-ion Secondary Chemical Cell |
| **MEMS** | Micro-Electro-Mechanical Systems |
| **OLED** | Organic Light Emitting Diode |
| **QTC** | Quantum Tunneling Composite |
| **REST** | Representational State Transfer |
| **SNR** | Signal-to-Noise Ratio |
| **SPI** | Serial Peripheral Interface |
| **TP4056** | 1A Standalone Linear Lithium-ion Battery Charger IC |
| **UART** | Universal Asynchronous Receiver-Transmitter (Serial Interface) |
| **UI/UX** | User Interface / User Experience |
| **WS** | WebSocket Bidirectional Streaming Protocol |
