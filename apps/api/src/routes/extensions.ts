// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import type { FastifyInstance } from 'fastify';
import { db } from '../db.js';
import { reloadPjsip } from '../asterisk.js';

interface CreateExtensionBody {
  extension: string;
  name: string;
  password: string;
  email?: string;
  callerId?: string;
  voicemail?: boolean;
  context?: string;
}

interface UpdateExtensionBody {
  name?: string;
  password?: string;
  email?: string;
  callerId?: string;
  voicemail?: boolean;
  context?: string;
}

export async function extensionRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return db.extension.findMany({ orderBy: { extension: 'asc' } });
  });

  app.get<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const ext = await db.extension.findUnique({ where: { id: req.params.id } });
    if (!ext) return reply.status(404).send({ error: 'Extension not found' });
    return ext;
  });

  app.post<{ Body: CreateExtensionBody }>('/', async (req, reply) => {
    const ext = await db.extension.create({ data: req.body });
    await reloadPjsip();
    return reply.status(201).send(ext);
  });

  app.put<{ Params: { id: string }; Body: UpdateExtensionBody }>('/:id', async (req, reply) => {
    const ext = await db.extension.findUnique({ where: { id: req.params.id } });
    if (!ext) return reply.status(404).send({ error: 'Extension not found' });
    const updated = await db.extension.update({ where: { id: req.params.id }, data: req.body });
    await reloadPjsip();
    return updated;
  });

  app.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const ext = await db.extension.findUnique({ where: { id: req.params.id } });
    if (!ext) return reply.status(404).send({ error: 'Extension not found' });
    await db.extension.delete({ where: { id: req.params.id } });
    await reloadPjsip();
    return reply.status(204).send();
  });
}
