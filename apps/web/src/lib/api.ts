// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import type {
  Extension, Trunk, InboundRoute, OutboundRoute,
  ActiveCall, PbxStats,
  CreateExtensionDto, CreateTrunkDto,
  CreateInboundRouteDto, CreateOutboundRouteDto,
} from './types';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export const api = {
  stats: {
    get: () => req<PbxStats>('/stats'),
  },

  extensions: {
    list:   ()                                           => req<Extension[]>('/extensions'),
    get:    (id: string)                                 => req<Extension>(`/extensions/${id}`),
    create: (data: CreateExtensionDto)                   => req<Extension>('/extensions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateExtensionDto>) => req<Extension>(`/extensions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string)                                 => req<void>(`/extensions/${id}`, { method: 'DELETE' }),
  },

  trunks: {
    list:   ()                                        => req<Trunk[]>('/trunks'),
    get:    (id: string)                              => req<Trunk>(`/trunks/${id}`),
    create: (data: CreateTrunkDto)                    => req<Trunk>('/trunks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateTrunkDto>) => req<Trunk>(`/trunks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string)                              => req<void>(`/trunks/${id}`, { method: 'DELETE' }),
  },

  inboundRoutes: {
    list:   ()                                               => req<InboundRoute[]>('/inbound-routes'),
    get:    (id: string)                                     => req<InboundRoute>(`/inbound-routes/${id}`),
    create: (data: CreateInboundRouteDto)                    => req<InboundRoute>('/inbound-routes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateInboundRouteDto>) => req<InboundRoute>(`/inbound-routes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string)                                     => req<void>(`/inbound-routes/${id}`, { method: 'DELETE' }),
  },

  outboundRoutes: {
    list:   ()                                                => req<OutboundRoute[]>('/outbound-routes'),
    get:    (id: string)                                      => req<OutboundRoute>(`/outbound-routes/${id}`),
    create: (data: CreateOutboundRouteDto)                    => req<OutboundRoute>('/outbound-routes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: CreateOutboundRouteDto)        => req<OutboundRoute>(`/outbound-routes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string)                                      => req<void>(`/outbound-routes/${id}`, { method: 'DELETE' }),
  },

  calls: {
    list:   ()           => req<ActiveCall[]>('/calls'),
    hangup: (id: string) => req<void>(`/calls/${id}`, { method: 'DELETE' }),
  },
};
