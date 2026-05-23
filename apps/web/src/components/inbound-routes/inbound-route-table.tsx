// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, ArrowDownToLine } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { InboundRouteForm } from './inbound-route-form';
import type { CreateInboundRouteDto, InboundRoute } from '@/lib/types';

export function InboundRouteTable() {
  const qc = useQueryClient();
  const [editTarget, setEditTarget] = useState<InboundRoute | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['inbound-routes'],
    queryFn: () => api.inboundRoutes.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateInboundRouteDto) => api.inboundRoutes.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inbound-routes'] });
      setShowCreate(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateInboundRouteDto> }) =>
      api.inboundRoutes.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inbound-routes'] });
      setEditTarget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.inboundRoutes.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inbound-routes'] }),
  });

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-zinc-600">Loading inbound routes…</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <p className="text-sm text-zinc-500">{routes.length} route{routes.length !== 1 && 's'}</p>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add Route
        </Button>
      </div>

      {routes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-border py-16 text-center">
          <p className="text-sm text-zinc-600">No inbound routes configured.</p>
          <p className="mt-1 text-xs text-zinc-600">
            Routes match incoming DIDs and send calls to extensions or dialplan contexts.
          </p>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => setShowCreate(true)}>
            Add your first route
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-surface-border">
          <table className="min-w-full divide-y divide-surface-border text-sm">
            <thead className="bg-surface-elevated">
              <tr>
                <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">Priority</th>
                <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">Name</th>
                <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">DID</th>
                <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">CID Match</th>
                <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">Destination</th>
                <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border bg-surface-card">
              {routes.map((route) => (
                <tr key={route.id} className="transition-colors hover:bg-surface-elevated/50">
                  <td className="px-4 py-3 text-center font-mono text-xs text-zinc-500">{route.priority}</td>
                  <td className="px-4 py-3 font-medium text-zinc-200">{route.name}</td>
                  <td className="px-4 py-3">
                    {route.did
                      ? <span className="font-mono text-xs text-accent-400">{route.did}</span>
                      : <Badge variant="neutral">Any</Badge>
                    }
                  </td>
                  <td className="px-4 py-3">
                    {route.cidNumber
                      ? <span className="font-mono text-xs text-zinc-400">{route.cidNumber}</span>
                      : <span className="text-xs text-zinc-600">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <ArrowDownToLine className="h-3 w-3 text-accent-500" />
                      <span className="font-mono text-xs text-zinc-300">{route.destination}</span>
                      <Badge variant="neutral" className="ml-1">{route.destinationType}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600">{formatDate(route.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditTarget(route)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm" variant="ghost"
                        className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
                        loading={deleteMutation.isPending && deleteMutation.variables === route.id}
                        onClick={() => {
                          if (confirm(`Delete inbound route "${route.name}"?`)) deleteMutation.mutate(route.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Inbound Route" size="lg">
        <InboundRouteForm
          onSubmit={(data) => createMutation.mutateAsync(data)}
          onCancel={() => setShowCreate(false)}
          loading={createMutation.isPending}
        />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit Route — ${editTarget?.name}`} size="lg">
        {editTarget && (
          <InboundRouteForm
            defaultValues={editTarget}
            onSubmit={(data) => updateMutation.mutateAsync({ id: editTarget.id, data })}
            onCancel={() => setEditTarget(null)}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>
    </>
  );
}
