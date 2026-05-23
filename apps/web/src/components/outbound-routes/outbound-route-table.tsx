// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { OutboundRouteForm } from './outbound-route-form';
import type { CreateOutboundRouteDto, OutboundRoute, TrunkType } from '@/lib/types';

const TYPE_VARIANT: Record<TrunkType, 'accent' | 'neutral' | 'warning'> = {
  PJSIP: 'accent', SIP: 'neutral', IAX2: 'warning',
};

export function OutboundRouteTable() {
  const qc = useQueryClient();
  const [editTarget, setEditTarget] = useState<OutboundRoute | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['outbound-routes'],
    queryFn: () => api.outboundRoutes.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateOutboundRouteDto) => api.outboundRoutes.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outbound-routes'] });
      setShowCreate(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateOutboundRouteDto }) =>
      api.outboundRoutes.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outbound-routes'] });
      setEditTarget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.outboundRoutes.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outbound-routes'] }),
  });

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-zinc-600">Loading outbound routes…</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <p className="text-sm text-zinc-500">{routes.length} route{routes.length !== 1 && 's'}</p>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5" /> Add Route
        </Button>
      </div>

      {routes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-border py-16 text-center">
          <p className="text-sm text-zinc-600">No outbound routes configured.</p>
          <p className="mt-1 text-xs text-zinc-600">
            Routes match dial patterns and send calls through trunks with failover.
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
                <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">Pri.</th>
                <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">Name</th>
                <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">Patterns</th>
                <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">Caller ID</th>
                <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">Trunk Failover</th>
                <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border bg-surface-card">
              {routes.map((route) => {
                const sortedTrunks = [...route.trunks].sort((a, b) => a.order - b.order);
                return (
                  <tr key={route.id} className="transition-colors hover:bg-surface-elevated/50">
                    <td className="px-4 py-3 text-center font-mono text-xs text-zinc-500">{route.priority}</td>
                    <td className="px-4 py-3 font-medium text-zinc-200">{route.name}</td>

                    {/* Patterns */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {route.patterns.slice(0, 3).map((p) => (
                          <span key={p.id} className="font-mono text-xs text-accent-400 bg-accent-500/10 px-1.5 py-0.5 rounded">
                            {p.pattern}
                          </span>
                        ))}
                        {route.patterns.length > 3 && (
                          <span className="text-xs text-zinc-600">+{route.patterns.length - 3} more</span>
                        )}
                        {route.patterns.length === 0 && (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </div>
                    </td>

                    {/* Caller ID */}
                    <td className="px-4 py-3 max-w-[140px]">
                      {route.callerId
                        ? <span className="truncate font-mono text-xs text-zinc-400">{route.callerId}</span>
                        : <span className="text-xs text-zinc-600">—</span>
                      }
                    </td>

                    {/* Trunk failover chain */}
                    <td className="px-4 py-3">
                      {sortedTrunks.length === 0 ? (
                        <span className="text-xs text-zinc-600">—</span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1">
                          {sortedTrunks.map((rt, i) => (
                            <span key={rt.id} className="flex items-center gap-1">
                              <Badge variant={TYPE_VARIANT[rt.trunk.type] ?? 'neutral'}>
                                {rt.trunk.name}
                              </Badge>
                              {i < sortedTrunks.length - 1 && (
                                <ArrowRight className="h-3 w-3 text-zinc-600" />
                              )}
                            </span>
                          ))}
                        </div>
                      )}
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
                            if (confirm(`Delete outbound route "${route.name}"?`)) deleteMutation.mutate(route.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Outbound Route" size="lg">
        <OutboundRouteForm
          onSubmit={(data) => createMutation.mutateAsync(data)}
          onCancel={() => setShowCreate(false)}
          loading={createMutation.isPending}
        />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit Route — ${editTarget?.name}`} size="lg">
        {editTarget && (
          <OutboundRouteForm
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
