// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import { AriClient } from './client.js';

export const ari = new AriClient(
  process.env.ASTERISK_HOST ?? 'localhost',
  Number(process.env.ASTERISK_ARI_PORT ?? 8088),
  process.env.ASTERISK_ARI_USER ?? 'asterisk',
  process.env.ASTERISK_ARI_PASSWORD ?? 'asterisk',
  process.env.ASTERISK_ARI_APP ?? 'quartz-pbx',
);

export { AriClient } from './client.js';
export type * from './types.js';
