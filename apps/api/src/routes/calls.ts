// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import type { FastifyInstance } from 'fastify';
import type { WebSocket } from '@fastify/websocket';
import { ari } from '../ari/index.js';
import type { AriEvent } from '../ari/types.js';

export async function callRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    if (!ari.isConnected()) return [];
    try {
      return await ari.getChannels();
    } catch {
      return [];
    }
  });

  app.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    if (!ari.isConnected()) {
      return reply.status(503).send({ error: 'Asterisk not connected' });
    }
    await ari.hangupChannel(req.params.id);
    return reply.status(204).send();
  });

  app.get('/ws', { websocket: true }, (socket: WebSocket) => {
    const onEvent = (event: AriEvent) => {
      if (socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify(event));
      }
    };

    ari.on('event', onEvent);

    socket.send(JSON.stringify({
      type: 'Connected',
      ariConnected: ari.isConnected(),
    }));

    socket.on('close', () => {
      ari.off('event', onEvent);
    });
  });
}
