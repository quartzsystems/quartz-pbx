// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import { EventEmitter } from 'events';
import WebSocket from 'ws';
import type { AriChannel, AriEvent, AriOriginateParams } from './types.js';

export class AriClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connected = false;

  constructor(
    private readonly host: string,
    private readonly port: number,
    private readonly username: string,
    private readonly password: string,
    private readonly appName: string,
  ) {
    super();
  }

  private get baseUrl() {
    return `http://${this.host}:${this.port}/ari`;
  }

  private get authHeader() {
    const encoded = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    return `Basic ${encoded}`;
  }

  connect() {
    if (this.ws) return;

    const wsUrl = `ws://${this.host}:${this.port}/ari/events?app=${this.appName}&subscribeAll=true`;

    this.ws = new WebSocket(wsUrl, {
      headers: { Authorization: this.authHeader },
    });

    this.ws.on('open', () => {
      this.connected = true;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      console.log('[ARI] Connected to Asterisk');
      this.emit('connected');
    });

    this.ws.on('message', (data: Buffer) => {
      try {
        const event: AriEvent = JSON.parse(data.toString());
        this.emit(event.type, event);
        this.emit('event', event);
      } catch {
        // Malformed event from Asterisk — ignore
      }
    });

    this.ws.on('close', () => {
      this.connected = false;
      this.ws = null;
      console.warn('[ARI] Disconnected, reconnecting in 5s');
      this.emit('disconnected');
      this.reconnectTimer = setTimeout(() => this.connect(), 5000);
    });

    this.ws.on('error', (err) => {
      console.warn('[ARI] WebSocket error:', err.message);
      this.emit('error', err);
    });
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.terminate();
    this.ws = null;
  }

  isConnected() {
    return this.connected;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`ARI ${init?.method ?? 'GET'} ${path} failed: ${res.status} ${res.statusText}`);
    }
    if (res.status === 204) return null as T;
    return res.json() as Promise<T>;
  }

  async getChannels(): Promise<AriChannel[]> {
    return this.request<AriChannel[]>('/channels');
  }

  async getChannel(channelId: string): Promise<AriChannel> {
    return this.request<AriChannel>(`/channels/${channelId}`);
  }

  async hangupChannel(channelId: string): Promise<void> {
    return this.request<void>(`/channels/${channelId}`, { method: 'DELETE' });
  }

  async originate(params: AriOriginateParams): Promise<AriChannel> {
    const body = {
      endpoint: params.endpoint,
      extension: params.extension,
      context: params.context,
      priority: params.priority ?? 1,
      callerId: params.callerId,
      timeout: params.timeout ?? 30,
      app: this.appName,
    };
    return this.request<AriChannel>('/channels', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async reloadModule(module: string): Promise<void> {
    return this.request<void>(`/asterisk/modules/${module}`, { method: 'PUT' });
  }
}
