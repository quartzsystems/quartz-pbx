// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { TrunkForm } from './trunk-form';
import type { CreateTrunkDto, Trunk, TrunkType } from '@/lib/types';

const TYPE_BADGE: Record<TrunkType, 'accent' | 'neutral' | 'warning'> = {
  PJSIP: 'accent',
  SIP:   'neutral',
  IAX2:  'warning',
};

export function TrunkTable() {
  const qc = useQueryClient();
  const [editTarget, setEditTarget] = useState<Trunk | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data: trunks = [], isLoading } = useQuery({
    queryKey: ['trunks'],
    queryFn: () => api.trunks.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTrunkDto) => api.trunks.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trunks'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      setShowCreate(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTrunkDto> }) =>
      api.trunks.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trunks'] });
      setEditTarget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.trunks.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trunks'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-zinc-600">Loading trunks…</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <p className="text-sm text-zinc-500">{trunks.length} trunk{trunks.length !== 1 && 's'}</p>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add Trunk
        </Button>
      </div>

      {trunks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-border py-16 text-center">
          <p className="text-sm text-zinc-600">No trunks configured.</p>
          <Button variant="primary" size="sm" className="mt-3" onClick={() => setShowCreate(true)}>
            Add your first trunk
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-surface-border">
          <table className="min-w-full divide-y divide-surface-border text-sm">
            <thead className="bg-surface-elevated">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Host</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Username</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Codecs</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Reg.</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border bg-surface-card">
              {trunks.map((trunk) => (
                <tr key={trunk.id} className="transition-colors hover:bg-surface-elevated/50">
                  <td className="px-4 py-3">
                    <Badge variant={TYPE_BADGE[trunk.type] ?? 'neutral'}>{trunk.type}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-accent-400">{trunk.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{trunk.host}</td>
                  <td className="px-4 py-3 text-zinc-300">{trunk.username}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{trunk.codecs}</td>
                  <td className="px-4 py-3">
                    {trunk.register
                      ? <Badge variant="accent"><CheckCircle2 className="mr-1 h-3 w-3" />Yes</Badge>
                      : <Badge variant="neutral">No</Badge>
                    }
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600">{formatDate(trunk.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditTarget(trunk)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm" variant="ghost"
                        className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
                        loading={deleteMutation.isPending && deleteMutation.variables === trunk.id}
                        onClick={() => {
                          if (confirm(`Delete trunk "${trunk.name}"?`)) deleteMutation.mutate(trunk.id);
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Trunk" size="lg">
        <TrunkForm
          onSubmit={(data) => createMutation.mutateAsync(data)}
          onCancel={() => setShowCreate(false)}
          loading={createMutation.isPending}
        />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={`Edit Trunk — ${editTarget?.name}`} size="lg">
        {editTarget && (
          <TrunkForm
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
