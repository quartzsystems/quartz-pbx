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
    <div className="rounded-lg border border-surface-border bg-surface-card p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">{label}</p>
          <p className="mt-1.5 font-mono text-[32px] font-semibold leading-none text-zinc-50">{value}</p>
        </div>
        <div
          className={
            accent
              ? 'rounded-md bg-accent-500/10 p-2.5'
              : 'rounded-md bg-surface-elevated p-2.5'
          }
        >
          <Icon className={`h-5 w-5 ${accent ? 'text-accent-500' : 'text-zinc-500'}`} strokeWidth={1.5} />
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
          <h2 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
            Active Calls
          </h2>
          <div className="overflow-hidden rounded-xl border border-surface-border bg-surface-card">
            <table className="min-w-full divide-y divide-surface-border text-sm">
              <thead>
                <tr className="bg-surface-elevated">
                  <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">Channel</th>
                  <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">Caller</th>
                  <th className="px-4 py-3 text-left font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-zinc-600">State</th>
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
