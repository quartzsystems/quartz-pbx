// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Voicemail } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { ExtensionForm } from './extension-form';
import type { CreateExtensionDto, Extension } from '@/lib/types';

export function ExtensionTable() {
  const qc = useQueryClient();
  const [editTarget, setEditTarget] = useState<Extension | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data: extensions = [], isLoading } = useQuery({
    queryKey: ['extensions'],
    queryFn: () => api.extensions.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateExtensionDto) => api.extensions.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extensions'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      setShowCreate(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateExtensionDto> }) =>
      api.extensions.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extensions'] });
      setEditTarget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.extensions.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['extensions'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-zinc-600">Loading extensions…</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <p className="text-sm text-zinc-500">
          {extensions.length} extension{extensions.length !== 1 && 's'}
        </p>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add Extension
        </Button>
      </div>

      {extensions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-border py-16 text-center">
          <p className="text-sm text-zinc-600">No extensions yet.</p>
          <Button variant="primary" size="sm" className="mt-3" onClick={() => setShowCreate(true)}>
            Create your first extension
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-surface-border">
          <table className="min-w-full divide-y divide-surface-border text-sm">
            <thead className="bg-surface-elevated">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Ext.</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Context</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Features</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border bg-surface-card">
              {extensions.map((ext) => (
                <tr key={ext.id} className="transition-colors hover:bg-surface-elevated/50">
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-accent-400">
                    {ext.extension}
                  </td>
                  <td className="px-4 py-3 text-zinc-200">{ext.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{ext.context}</td>
                  <td className="px-4 py-3">
                    {ext.voicemail && (
                      <Badge variant="neutral">
                        <Voicemail className="mr-1 h-3 w-3" />
                        Voicemail
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600">{formatDate(ext.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditTarget(ext)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
                        loading={deleteMutation.isPending && deleteMutation.variables === ext.id}
                        onClick={() => {
                          if (confirm(`Delete extension ${ext.extension} (${ext.name})?`)) {
                            deleteMutation.mutate(ext.id);
                          }
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Extension" size="lg">
        <ExtensionForm
          onSubmit={(data) => createMutation.mutateAsync(data)}
          onCancel={() => setShowCreate(false)}
          loading={createMutation.isPending}
        />
      </Modal>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Edit Extension ${editTarget?.extension}`}
        size="lg"
      >
        {editTarget && (
          <ExtensionForm
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
