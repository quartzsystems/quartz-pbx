// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

'use client';

import { useQuery } from '@tanstack/react-query';
import { Phone, GitBranch, PhoneCall, Activity } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent?: boolean;
}

function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-zinc-50">{value}</p>
        </div>
        <div
          className={
            accent
              ? 'rounded-lg bg-accent-500/10 p-3'
              : 'rounded-lg bg-surface-elevated p-3'
          }
        >
          <Icon className={`h-5 w-5 ${accent ? 'text-accent-500' : 'text-zinc-400'}`} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.stats.get(),
    refetchInterval: 15_000,
  });

  const { data: calls = [] } = useQuery({
    queryKey: ['calls'],
    queryFn: () => api.calls.list(),
    refetchInterval: 5_000,
  });

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Overview of your Quartz PBX system" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Extensions" value={stats?.totalExtensions ?? '—'} icon={Phone} />
        <StatCard label="SIP Trunks" value={stats?.totalTrunks ?? '—'} icon={GitBranch} />
        <StatCard label="Active Calls" value={calls.length} icon={PhoneCall} accent />
        <StatCard label="System Status" value="Online" icon={Activity} accent />
      </div>

      {calls.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Active Calls
          </h2>
          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
            <table className="min-w-full divide-y divide-surface-border text-sm">
              <thead>
                <tr className="bg-surface-elevated">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Channel</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">Caller</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {calls.map((call) => (
                  <tr key={call.id} className="hover:bg-surface-elevated/50">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{call.name}</td>
                    <td className="px-4 py-3 text-zinc-300">
                      {call.caller.name} &lt;{call.caller.number}&gt;
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="accent">{call.state}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
