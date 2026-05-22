// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import type { FastifyInstance } from 'fastify';
import { db } from '../db.js';
import { reloadAll } from '../asterisk.js';

interface CreateTrunkBody {
  type?: string;
  name: string;
  host: string;
  username: string;
  password: string;
  context?: string;
  codecs?: string;
  register?: boolean;
}

interface UpdateTrunkBody {
  type?: string;
  name?: string;
  host?: string;
  username?: string;
  password?: string;
  context?: string;
  codecs?: string;
  register?: boolean;
}

export async function trunkRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return db.trunk.findMany({ orderBy: { name: 'asc' } });
  });

  app.get<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const trunk = await db.trunk.findUnique({ where: { id: req.params.id } });
    if (!trunk) return reply.status(404).send({ error: 'Trunk not found' });
    return trunk;
  });

  app.post<{ Body: CreateTrunkBody }>('/', async (req, reply) => {
    const trunk = await db.trunk.create({ data: req.body });
    await reloadAll();
    return reply.status(201).send(trunk);
  });

  app.put<{ Params: { id: string }; Body: UpdateTrunkBody }>('/:id', async (req, reply) => {
    const trunk = await db.trunk.findUnique({ where: { id: req.params.id } });
    if (!trunk) return reply.status(404).send({ error: 'Trunk not found' });
    const updated = await db.trunk.update({ where: { id: req.params.id }, data: req.body });
    await reloadAll();
    return updated;
  });

  app.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const trunk = await db.trunk.findUnique({ where: { id: req.params.id } });
    if (!trunk) return reply.status(404).send({ error: 'Trunk not found' });
    await db.trunk.delete({ where: { id: req.params.id } });
    await reloadAll();
    return reply.status(204).send();
  });
}
