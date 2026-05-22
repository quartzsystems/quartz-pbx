// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

export type TrunkType = 'SIP' | 'PJSIP' | 'IAX2';

export interface Extension {
  id: string;
  extension: string;
  name: string;
  password: string;
  email: string | null;
  callerId: string | null;
  voicemail: boolean;
  context: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trunk {
  id: string;
  type: TrunkType;
  name: string;
  host: string;
  username: string;
  password: string;
  context: string;
  codecs: string;
  register: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InboundRoute {
  id: string;
  name: string;
  did: string | null;
  cidNumber: string | null;
  destination: string;
  destinationType: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface OutboundRoutePattern {
  id: string;
  pattern: string;
}

export interface OutboundRouteTrunk {
  id: string;
  order: number;
  trunk: { id: string; name: string; type: TrunkType };
}

export interface OutboundRoute {
  id: string;
  name: string;
  callerId: string | null;
  prepend: string;
  stripDigits: number;
  priority: number;
  createdAt: string;
  updatedAt: string;
  patterns: OutboundRoutePattern[];
  trunks: OutboundRouteTrunk[];
}

export interface ActiveCall {
  id: string;
  name: string;
  state: string;
  caller: { name: string; number: string };
  connected: { name: string; number: string };
  creationtime: string;
}

export interface PbxStats {
  totalExtensions: number;
  totalTrunks: number;
  totalInboundRoutes: number;
  totalOutboundRoutes: number;
}

export interface CreateExtensionDto {
  extension: string;
  name: string;
  password: string;
  email?: string;
  callerId?: string;
  voicemail?: boolean;
  context?: string;
}

export interface CreateTrunkDto {
  type?: TrunkType;
  name: string;
  host: string;
  username: string;
  password: string;
  context?: string;
  codecs?: string;
  register?: boolean;
}

export interface CreateInboundRouteDto {
  name: string;
  did?: string;
  cidNumber?: string;
  destination: string;
  destinationType?: string;
  priority?: number;
}

export interface CreateOutboundRouteDto {
  name: string;
  callerId?: string;
  patterns: string[];
  trunkIds?: string[];
  prepend?: string;
  stripDigits?: number;
  priority?: number;
}
