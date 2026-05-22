// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { extensionRoutes } from './routes/extensions.js';
import { trunkRoutes } from './routes/trunks.js';
import { callRoutes } from './routes/calls.js';
import { inboundRouteRoutes } from './routes/inbound-routes.js';
import { outboundRouteRoutes } from './routes/outbound-routes.js';
import { db } from './db.js';

export function buildServer() {
  const app = Fastify({
    logger: {
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  });

  app.register(cors, {
    origin: process.env.WEB_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  app.register(websocket);

  app.register(extensionRoutes,     { prefix: '/api/extensions' });
  app.register(trunkRoutes,         { prefix: '/api/trunks' });
  app.register(callRoutes,          { prefix: '/api/calls' });
  app.register(inboundRouteRoutes,  { prefix: '/api/inbound-routes' });
  app.register(outboundRouteRoutes, { prefix: '/api/outbound-routes' });

  app.get('/api/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  app.get('/api/stats', async () => {
    const [totalExtensions, totalTrunks, totalInboundRoutes, totalOutboundRoutes] =
      await Promise.all([
        db.extension.count(),
        db.trunk.count(),
        db.inboundRoute.count(),
        db.outboundRoute.count(),
      ]);
    return { totalExtensions, totalTrunks, totalInboundRoutes, totalOutboundRoutes };
  });

  app.addHook('onClose', async () => {
    await db.$disconnect();
  });

  return app;
}
