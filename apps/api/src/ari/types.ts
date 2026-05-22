// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

export interface AriCaller {
  name: string;
  number: string;
}

export interface AriDialplan {
  context: string;
  exten: string;
  priority: number;
}

export interface AriChannel {
  id: string;
  name: string;
  state: string;
  caller: AriCaller;
  connected: AriCaller;
  accountcode: string;
  dialplan: AriDialplan;
  creationtime: string;
  language: string;
}

export interface AriEvent {
  type: string;
  timestamp: string;
  application?: string;
  channel?: AriChannel;
  peer?: AriChannel;
  cause?: number;
  cause_txt?: string;
}

export interface AriOriginateParams {
  endpoint: string;
  extension: string;
  context: string;
  priority?: number;
  callerId?: string;
  timeout?: number;
}
