// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PhoneOff } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDuration } from '@/lib/utils';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CallsPage() {
  const qc = useQueryClient();

  const { data: calls = [], isLoading } = useQuery({
    queryKey: ['calls'],
    queryFn: () => api.calls.list(),
    refetchInterval: 3_000,
  });

  const hangupMutation = useMutation({
    mutationFn: (id: string) => api.calls.hangup(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calls'] }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Calls"
        description="Active channels — auto-refreshes every 3 seconds"
      />

      {isLoading ? (
        <p className="py-16 text-center text-sm text-zinc-600">Loading…</p>
      ) : calls.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-border py-16 text-center">
          <p className="text-sm text-zinc-600">No active calls</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-surface-border">
          <table className="min-w-full divide-y divide-surface-border text-sm">
            <thead className="bg-surface-elevated">
              <tr>
                <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">Channel</th>
                <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">Caller</th>
                <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">Connected</th>
                <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">State</th>
                <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">Duration</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border bg-surface-card">
              {calls.map((call) => (
                <tr key={call.id} className="hover:bg-surface-elevated/50">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{call.name}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    {call.caller.name} &lt;{call.caller.number}&gt;
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {call.connected.name} &lt;{call.connected.number}&gt;
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="accent" dot>{call.state}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-500">
                    {formatDuration(call.creationtime)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="danger"
                      loading={hangupMutation.isPending && hangupMutation.variables === call.id}
                      onClick={() => hangupMutation.mutate(call.id)}
                    >
                      <PhoneOff className="h-3.5 w-3.5" />
                      Hangup
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
