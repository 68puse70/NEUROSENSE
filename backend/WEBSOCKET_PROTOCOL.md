# NeuroSense Telemetry WebSocket Protocol Specification (v1.0)

This document defines the versioned JSON payload schema streamed over the WebSocket endpoint (`ws://127.0.0.1:8000/ws/telemetry`).

## Connection Endpoint
- **URL**: `ws://127.0.0.1:8000/ws/telemetry`
- **Subprotocol**: `neurosense-v1.0`

## Message Schema (Type: `telemetry_frame`)

Every telemetry frame broadcast by the server adheres to the following JSON structure:

```json
{
  "protocolVersion": "1.0",
  "type": "telemetry_frame",
  "timestamp": 1728498000000,
  "timestampUtc": "2026-10-09T17:39:22.100Z",
  "formattedTime": "23:39:22.100",
  "readings": {
    "fsr_thumb": {
      "id": "fsr_thumb",
      "name": "FSR Thumb Tip",
      "type": "fsr",
      "rawAdc": 2450,
      "filteredValue": 2420,
      "normalizedPercent": 62,
      "unit": "ADC",
      "minRaw": 120,
      "maxRaw": 3950,
      "status": "normal",
      "lastUpdated": 1728498000000
    },
    "flex_thumb": {
      "id": "flex_thumb",
      "name": "Flex Thumb Joint",
      "type": "flex",
      "rawAdc": 1950,
      "filteredValue": 1940,
      "normalizedPercent": 35,
      "unit": "ADC",
      "minRaw": 1450,
      "maxRaw": 3400,
      "status": "normal",
      "lastUpdated": 1728498000000
    }
  }
}
```

## Field Descriptions

| Field | Type | Description |
| :--- | :--- | :--- |
| `protocolVersion` | `string` | Version identifier (e.g. `"1.0"`) |
| `type` | `string` | Payload classification (`"telemetry_frame"`, `"status_heartbeat"`, `"control_ack"`) |
| `timestamp` | `number` | Unix timestamp in milliseconds |
| `timestampUtc` | `string` | Standard ISO-8601 UTC string |
| `formattedTime` | `string` | Local HH:MM:SS.mmm formatted string |
| `readings` | `object` | Dictionary of sensor IDs mapped to individual sensor telemetry objects |

## Reading Object Fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique hardware channel identifier (e.g., `"fsr_thumb"`) |
| `name` | `string` | Human-readable channel display label |
| `type` | `string` | Sensor classification (`"fsr"`, `"flex"`, `"emg"`) |
| `rawAdc` | `number` | 12-bit hardware ADC reading (`0` to `4095`) |
| `filteredValue` | `number` | Exponential moving average filtered value |
| `normalizedPercent` | `number` | Calibrated percentage load (`0%` to `100%`) |
| `status` | `string` | Channel status (`"normal"`, `"warning"`, `"error"`, `"stale"`, `"disconnected"`) |

## Transport Lifecycle & Stale Timeout Rules

1. **Server Broadcast Frequency**: Broadcasts frames at the active sampling rate (default 20 Hz).
2. **Client Stale Detection**: If no packet is received for **>1500 ms**, the client marks data as `STALE`.
3. **Bounded Backoff Reconnect**: Upon unexpected socket closure, client reconnects using exponential backoff (`1s`, `2s`, `4s`, `8s`, max `10s`).
