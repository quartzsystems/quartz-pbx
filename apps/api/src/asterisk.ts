// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import { db } from './db.js';
import { writeAllConf } from './config-gen.js';
import { ari } from './ari/index.js';

async function tryReload(module: string): Promise<void> {
  if (!ari.isConnected()) return;
  try {
    await ari.reloadModule(module);
  } catch (err) {
    console.warn(`[asterisk] reload ${module} failed:`, (err as Error).message);
  }
}

const OUTBOUND_INCLUDE = {
  patterns: true,
  trunks: { include: { trunk: true }, orderBy: { order: 'asc' as const } },
} as const;

export async function reloadAll(): Promise<void> {
  const [extensions, trunks, inbound, outbound] = await Promise.all([
    db.extension.findMany(),
    db.trunk.findMany(),
    db.inboundRoute.findMany(),
    db.outboundRoute.findMany({ include: OUTBOUND_INCLUDE }),
  ]);

  await writeAllConf(extensions, trunks, inbound, outbound);

  const hasPjsip = trunks.some((t) => t.type === 'PJSIP') || extensions.length > 0;
  const hasSip   = trunks.some((t) => t.type === 'SIP');
  const hasIax2  = trunks.some((t) => t.type === 'IAX2');

  await Promise.all([
    hasPjsip && tryReload('res_pjsip.so'),
    hasSip   && tryReload('chan_sip.so'),
    hasIax2  && tryReload('chan_iax2.so'),
    tryReload('pbx_config.so'),
  ]);
}
