// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import { buildServer } from './server.js';
import { ari } from './ari/index.js';

const app = buildServer();
const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0';

try {
  ari.connect();
} catch (err) {
  console.warn('[startup] ARI connect failed (Asterisk may not be running):', (err as Error).message);
}

try {
  await app.listen({ port, host });
  console.log(`Quartz PBX API listening on ${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
