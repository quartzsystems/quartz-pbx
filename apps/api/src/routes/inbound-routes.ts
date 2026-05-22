// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import type { FastifyInstance } from 'fastify';
import { db } from '../db.js';
import { reloadAll } from '../asterisk.js';

interface CreateBody {
  name: string;
  did?: string;
  cidNumber?: string;
  destination: string;
  destinationType?: string;
  priority?: number;
}

interface UpdateBody {
  name?: string;
  did?: string;
  cidNumber?: string;
  destination?: string;
  destinationType?: string;
  priority?: number;
}

export async function inboundRouteRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return db.inboundRoute.findMany({ orderBy: [{ priority: 'asc' }, { name: 'asc' }] });
  });

  app.get<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const route = await db.inboundRoute.findUnique({ where: { id: req.params.id } });
    if (!route) return reply.status(404).send({ error: 'Inbound route not found' });
    return route;
  });

  app.post<{ Body: CreateBody }>('/', async (req, reply) => {
    const route = await db.inboundRoute.create({ data: req.body });
    await reloadAll();
    return reply.status(201).send(route);
  });

  app.put<{ Params: { id: string }; Body: UpdateBody }>('/:id', async (req, reply) => {
    const route = await db.inboundRoute.findUnique({ where: { id: req.params.id } });
    if (!route) return reply.status(404).send({ error: 'Inbound route not found' });
    const updated = await db.inboundRoute.update({ where: { id: req.params.id }, data: req.body });
    await reloadAll();
    return updated;
  });

  app.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const route = await db.inboundRoute.findUnique({ where: { id: req.params.id } });
    if (!route) return reply.status(404).send({ error: 'Inbound route not found' });
    await db.inboundRoute.delete({ where: { id: req.params.id } });
    await reloadAll();
    return reply.status(204).send();
  });
}
