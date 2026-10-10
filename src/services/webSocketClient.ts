import { TelemetryFrame } from '../types/sensor';

export type WebSocketConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface WebSocketTelemetryMessage {
  protocolVersion: string;
  type: string;
  timestamp: number;
  timestampUtc: string;
  formattedTime: string;
  readings: TelemetryFrame['readings'];
}

export class WebSocketClient {
  private static instance: WebSocketClient | null = null;
  private ws: WebSocket | null = null;
  private url: string = 'ws://127.0.0.1:8000/ws/telemetry';
  private connectionState: WebSocketConnectionState = 'disconnected';
  private reconnectAttempt: number = 0;
  private maxReconnectDelayMs: number = 10000;
  private reconnectTimer: number | null = null;
  private explicitDisconnect: boolean = false;

  private onFrameCallbacks: Array<(frame: TelemetryFrame) => void> = [];
  private onStateChangeCallbacks: Array<(state: WebSocketConnectionState, attempt: number) => void> = [];

  private constructor() {}

  public static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient();
    }
    return WebSocketClient.instance;
  }

  public connect(url: string = 'ws://127.0.0.1:8000/ws/telemetry') {
    this.url = url;
    this.explicitDisconnect = false;

    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return; // Connection already active or in progress
    }

    this.updateState(this.reconnectAttempt > 0 ? 'reconnecting' : 'connecting');

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempt = 0;
        this.updateState('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketTelemetryMessage = JSON.parse(event.data);
          if (data.type === 'telemetry_frame' && data.readings) {
            const frame: TelemetryFrame = {
              timestamp: data.timestamp,
              formattedTime: data.formattedTime,
              readings: data.readings,
            };
            this.notifyFrame(frame);
          }
        } catch (err) {
          // Ignore parse errors
        }
      };

      this.ws.onclose = () => {
        this.ws = null;
        if (!this.explicitDisconnect) {
          this.scheduleReconnect();
        } else {
          this.updateState('disconnected');
        }
      };

      this.ws.onerror = () => {
        // Socket closed handler will trigger reconnect
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    this.explicitDisconnect = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.updateState('disconnected');
  }

  private scheduleReconnect() {
    this.updateState('reconnecting');
    this.reconnectAttempt += 1;
    // Bounded exponential backoff: 1s, 2s, 4s, 8s, max 10s
    const delay = Math.min(
      this.maxReconnectDelayMs,
      Math.pow(2, this.reconnectAttempt - 1) * 1000 + Math.random() * 500
    );

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    this.reconnectTimer = window.setTimeout(() => {
      this.connect(this.url);
    }, delay);
  }

  private updateState(state: WebSocketConnectionState) {
    this.connectionState = state;
    this.onStateChangeCallbacks.forEach((cb) => cb(state, this.reconnectAttempt));
  }

  private notifyFrame(frame: TelemetryFrame) {
    this.onFrameCallbacks.forEach((cb) => cb(frame));
  }

  public onFrame(callback: (frame: TelemetryFrame) => void): () => void {
    this.onFrameCallbacks.push(callback);
    return () => {
      this.onFrameCallbacks = this.onFrameCallbacks.filter((cb) => cb !== callback);
    };
  }

  public onStateChange(callback: (state: WebSocketConnectionState, attempt: number) => void): () => void {
    this.onStateChangeCallbacks.push(callback);
    callback(this.connectionState, this.reconnectAttempt);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter((cb) => cb !== callback);
    };
  }

  public getState(): WebSocketConnectionState {
    return this.connectionState;
  }
}
