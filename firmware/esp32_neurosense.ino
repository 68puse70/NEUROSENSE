/*
 * ==============================================================================
 *  NEUROSENSE ESP32 FIRMWARE v1.0
 * ==============================================================================
 *  Production-ready Arduino C++ sketch for ESP32 microcontroller.
 *  Reads 12-bit ADC values (0–4095) from FSR and Flex sensors, packages them
 *  into JSON telemetry frames with sequence numbers, and submits them over HTTP
 *  POST to the NeuroSense FastAPI server.
 *
 *  Hardware Pinout Assignment:
 *  ----------------------------------------------------------------------------
 *  Channel ID      Sensor Type    ESP32 Pin    ADC Channel
 *  ----------------------------------------------------------------------------
 *  fsr_thumb       FSR            GPIO 36      ADC1_CH0 (VP)
 *  fsr_index       FSR            GPIO 39      ADC1_CH3 (VN)
 *  fsr_middle      FSR            GPIO 34      ADC1_CH6
 *  fsr_ring        FSR            GPIO 35      ADC1_CH7
 *  fsr_pinky       FSR            GPIO 32      ADC1_CH4
 *  fsr_palm        FSR            GPIO 33      ADC1_CH5
 *  flex_thumb      Flex           GPIO 25      ADC2_CH8 / ADC1
 *  flex_index      Flex           GPIO 26      ADC2_CH9 / ADC1
 *  flex_middle     Flex           GPIO 27      ADC2_CH7
 *  flex_ring       Flex           GPIO 14      ADC2_CH6
 *  flex_pinky      Flex           GPIO 12      ADC2_CH5
 * ==============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ── Wi-Fi Configuration ──────────────────────────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// ── NeuroSense Backend API Configuration ─────────────────────────────────────
// Replace with the IP address of the machine running backend/main.py
const char* BACKEND_IP   = "192.168.1.100"; 
const int   BACKEND_PORT = 8000;
const char* DEVICE_ID    = "esp32_neurosense_proto_01";

// API Endpoints
String TELEMETRY_URL = "http://" + String(BACKEND_IP) + ":" + String(BACKEND_PORT) + "/api/device/telemetry";
String HEARTBEAT_URL = "http://" + String(BACKEND_IP) + ":" + String(BACKEND_PORT) + "/api/device/heartbeat";

// ── Hardware Pin Configuration ───────────────────────────────────────────────
struct SensorPinMap {
  const char* id;
  int gpioPin;
};

const SensorPinMap SENSORS[] = {
  {"fsr_thumb",   36},
  {"fsr_index",   39},
  {"fsr_middle",  34},
  {"fsr_ring",    35},
  {"fsr_pinky",   32},
  {"fsr_palm",    33},
  {"flex_thumb",  25},
  {"flex_index",  26},
  {"flex_middle", 27},
  {"flex_ring",   14},
  {"flex_pinky",  12}
};

const int NUM_SENSORS = sizeof(SENSORS) / sizeof(SENSORS[0]);

// ── Timing & Acquisition Settings ───────────────────────────────────────────
const unsigned long TELEMETRY_INTERVAL_MS = 20;   // 50 Hz hardware acquisition rate
const unsigned long HEARTBEAT_INTERVAL_MS = 5000;  // 5 sec periodic health ping

unsigned long lastTelemetryMs = 0;
unsigned long lastHeartbeatMs = 0;
unsigned long sequenceCounter = 0;

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  
  Serial.print("[Wi-Fi] Connecting to ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Connected! IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[Wi-Fi] Connection failed. Retrying in next loop...");
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("==========================================");
  Serial.println("  NeuroSense ESP32 Hardware Acquisition  ");
  Serial.println("==========================================");

  // Configure 12-bit ADC resolution (0 - 4095) & 11dB attenuation (0 - 3.3V range)
  analogReadResolution(12);
  for (int i = 0; i < NUM_SENSORS; i++) {
    pinMode(SENSORS[i].gpioPin, INPUT);
    analogSetPinAttenuation(SENSORS[i].gpioPin, ADC_11db);
  }

  connectWiFi();
}

void sendTelemetry() {
  if (WiFi.status() != WL_CONNECTED) return;

  // Build JSON payload
  StaticJsonDocument<1024> doc;
  doc["deviceId"]          = DEVICE_ID;
  doc["sequence"]          = sequenceCounter++;
  doc["deviceTimestampMs"] = millis();
  doc["wifiRssi"]          = WiFi.RSSI();

  JsonObject readingsObj = doc.createNestedObject("readings");

  // Read analog pins (averaged over 4 samples for noise reduction)
  for (int i = 0; i < NUM_SENSORS; i++) {
    int sum = 0;
    for (int s = 0; s < 4; s++) {
      sum += analogRead(SENSORS[i].gpioPin);
    }
    int rawAdc = sum / 4;
    readingsObj[SENSORS[i].id] = rawAdc;
  }

  String jsonString;
  serializeJson(doc, jsonString);

  // Send HTTP POST to FastAPI backend
  HTTPClient http;
  http.begin(TELEMETRY_URL);
  http.addHeader("Content-Type", "application/json");
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode != 202 && httpResponseCode != 200) {
    Serial.printf("[Telemetry] HTTP POST failed with code: %d\n", httpResponseCode);
  }
  http.end();
}

void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;

  StaticJsonDocument<256> doc;
  doc["deviceId"]        = DEVICE_ID;
  doc["uptimeSeconds"]   = millis() / 1000;
  doc["wifiRssi"]        = WiFi.RSSI();
  doc["freeHeapBytes"]   = ESP.getFreeHeap();
  doc["firmwareVersion"] = "1.0.0";

  String jsonString;
  serializeJson(doc, jsonString);

  HTTPClient http;
  http.begin(HEARTBEAT_URL);
  http.addHeader("Content-Type", "application/json");
  http.POST(jsonString);
  http.end();
}

void loop() {
  connectWiFi();
  unsigned long now = millis();

  if (now - lastTelemetryMs >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryMs = now;
    sendTelemetry();
  }

  if (now - lastHeartbeatMs >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeatMs = now;
    sendHeartbeat();
  }
}
