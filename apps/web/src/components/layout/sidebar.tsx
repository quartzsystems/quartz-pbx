// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Phone, GitBranch, PhoneCall, Settings,
  ChevronDown, ChevronRight,
  Monitor, Layers, Network, AppWindow,
  ArrowDownToLine, ArrowUpFromLine, BarChart2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Primitives ────────────────────────────────────────────────────────────────

function NavLink({
  href,
  label,
  icon: Icon,
  indent = 3,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  indent?: number;
}) {
  const pathname = usePathname();
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <Link
      href={href}
      style={{ paddingLeft: `${indent * 0.25}rem` }}
      className={cn(
        'flex items-center gap-2.5 rounded-md py-1.5 pr-3 text-sm font-medium transition-colors',
        active
          ? 'bg-accent-500/10 text-accent-400'
          : 'text-zinc-500 hover:bg-surface-elevated hover:text-zinc-200',
      )}
    >
      <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-accent-500' : 'text-zinc-600')} />
      {label}
    </Link>
  );
}

function TopGroup({
  label,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left transition-colors hover:bg-surface-elevated"
      >
        <Icon className="h-4 w-4 shrink-0 text-zinc-500" />
        <span className="flex-1 text-sm font-semibold text-zinc-300">{label}</span>
        <Chevron className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
      </button>
      {open && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}

function SubSection({
  label,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <div className="mt-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-md py-1.5 pl-4 pr-3 text-left transition-colors hover:bg-surface-elevated"
      >
        <Icon className="h-4 w-4 shrink-0 text-zinc-400" />
        <span className="flex-1 text-sm font-semibold text-zinc-200">{label}</span>
        <Chevron className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
      </button>
      {open && (
        <div className="mt-0.5 space-y-0.5 border-l border-surface-border ml-6">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 flex-col border-r border-surface-border bg-surface-card">
      <div className="flex h-16 items-center border-b border-surface-border px-5">
        <span className="text-lg font-bold tracking-tight text-accent-500">Quartz PBX</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-1">

          <TopGroup label="System" icon={Monitor}>
            <NavLink href="/" label="Dashboard" icon={LayoutDashboard} indent={6} />
          </TopGroup>

          <TopGroup label="PBX Configuration" icon={Layers}>
            <SubSection label="Applications" icon={AppWindow}>
              <NavLink href="/extensions" label="Extensions" icon={Phone} indent={8} />
            </SubSection>
            <SubSection label="Connectivity" icon={Network}>
              <NavLink href="/trunks"          label="Trunks"          icon={GitBranch}       indent={8} />
              <NavLink href="/inbound-routes"  label="Inbound Routes"  icon={ArrowDownToLine} indent={8} />
              <NavLink href="/outbound-routes" label="Outbound Routes" icon={ArrowUpFromLine} indent={8} />
            </SubSection>
          </TopGroup>

          <TopGroup label="Reports" icon={BarChart2}>
            <NavLink href="/calls" label="Live Calls" icon={PhoneCall} indent={6} />
          </TopGroup>

          <div className="pt-2 space-y-0.5">
            <NavLink href="/settings" label="Settings" icon={Settings} indent={3} />
          </div>

        </div>
      </nav>

      <div className="border-t border-surface-border px-5 py-4">
        <p className="text-xs text-zinc-600">Quartz PBX v0.1.0</p>
      </div>
    </aside>
  );
}
