// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import type { FastifyInstance } from 'fastify';
import { db } from '../db.js';
import { reloadAll } from '../asterisk.js';

const INCLUDE = {
  patterns: true,
  trunks: {
    include: { trunk: { select: { id: true, name: true, type: true } } },
    orderBy: { order: 'asc' as const },
  },
} as const;

interface CreateBody {
  name: string;
  callerId?: string;
  patterns: string[];
  trunkIds?: string[];
  prepend?: string;
  stripDigits?: number;
  priority?: number;
}

export async function outboundRouteRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return db.outboundRoute.findMany({
      orderBy: [{ priority: 'asc' }, { name: 'asc' }],
      include: INCLUDE,
    });
  });

  app.get<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const route = await db.outboundRoute.findUnique({ where: { id: req.params.id }, include: INCLUDE });
    if (!route) return reply.status(404).send({ error: 'Outbound route not found' });
    return route;
  });

  app.post<{ Body: CreateBody }>('/', async (req, reply) => {
    const { name, callerId, patterns = [], trunkIds = [], prepend, stripDigits, priority } = req.body;
    const route = await db.outboundRoute.create({
      data: {
        name, callerId, prepend, stripDigits, priority,
        patterns: { create: patterns.map((p) => ({ pattern: p })) },
        trunks:   { create: trunkIds.map((id, i) => ({ trunkId: id, order: i })) },
      },
      include: INCLUDE,
    });
    await reloadAll();
    return reply.status(201).send(route);
  });

  app.put<{ Params: { id: string }; Body: CreateBody }>('/:id', async (req, reply) => {
    const existing = await db.outboundRoute.findUnique({ where: { id: req.params.id } });
    if (!existing) return reply.status(404).send({ error: 'Outbound route not found' });

    const { name, callerId, patterns = [], trunkIds = [], prepend, stripDigits, priority } = req.body;

    // Replace patterns and trunks atomically
    const updated = await db.$transaction(async (tx) => {
      await tx.outboundRoutePattern.deleteMany({ where: { outboundRouteId: req.params.id } });
      await tx.outboundRouteTrunk.deleteMany({ where: { outboundRouteId: req.params.id } });
      return tx.outboundRoute.update({
        where: { id: req.params.id },
        data: {
          name, callerId, prepend, stripDigits, priority,
          patterns: { create: patterns.map((p) => ({ pattern: p })) },
          trunks:   { create: trunkIds.map((id, i) => ({ trunkId: id, order: i })) },
        },
        include: INCLUDE,
      });
    });

    await reloadAll();
    return updated;
  });

  app.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const existing = await db.outboundRoute.findUnique({ where: { id: req.params.id } });
    if (!existing) return reply.status(404).send({ error: 'Outbound route not found' });
    await db.outboundRoute.delete({ where: { id: req.params.id } });
    await reloadAll();
    return reply.status(204).send();
  });
}
