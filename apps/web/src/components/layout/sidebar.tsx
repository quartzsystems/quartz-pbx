// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Phone, GitBranch, PhoneCall, Settings,
  ChevronDown, ChevronRight, Layers, AppWindow, Network,
  ArrowDownToLine, ArrowUpFromLine, Monitor, BarChart2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function NavItem({
  href,
  label,
  icon: Icon,
  indent = false,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  indent?: boolean;
}) {
  const pathname = usePathname();
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 rounded-md border py-2 pr-3 text-[13px] font-medium transition-colors duration-120',
        indent ? 'pl-7' : 'pl-2.5',
        active
          ? 'border-accent-500/30 bg-accent-500/10 text-accent-400'
          : 'border-transparent text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-100',
      )}
    >
      <Icon
        className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-accent-500' : 'text-zinc-600')}
        strokeWidth={1.5}
      />
      {label}
    </Link>
  );
}

function CollapsibleGroup({
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
        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors duration-120 hover:bg-white/[0.04]"
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-600" strokeWidth={1.5} />
        <span className="flex-1 text-[13px] font-semibold text-zinc-400">{label}</span>
        <Chevron className="h-3 w-3 shrink-0 text-zinc-600" strokeWidth={1.5} />
      </button>
      {open && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}

function SubSection({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-1">
      <div className="flex items-center gap-2 px-4 pb-1 pt-1">
        <Icon className="h-3 w-3 text-zinc-700" strokeWidth={1.5} />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-700">{label}</span>
      </div>
      <div className="ml-5 space-y-0.5 border-l border-surface-border">
        {children}
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 flex-col border-r border-surface-border bg-surface-sunken">
      <div className="flex h-14 items-center border-b border-surface-border px-4">
        <span className="text-base font-bold tracking-tight text-accent-500">Quartz PBX</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        <CollapsibleGroup label="System" icon={Monitor}>
          <NavItem href="/" label="Dashboard" icon={LayoutDashboard} />
        </CollapsibleGroup>

        <CollapsibleGroup label="PBX Configuration" icon={Layers}>
          <SubSection label="Applications" icon={AppWindow}>
            <NavItem href="/extensions" label="Extensions" icon={Phone} indent />
          </SubSection>
          <SubSection label="Connectivity" icon={Network}>
            <NavItem href="/trunks" label="Trunks" icon={GitBranch} indent />
            <NavItem href="/inbound-routes" label="Inbound Routes" icon={ArrowDownToLine} indent />
            <NavItem href="/outbound-routes" label="Outbound Routes" icon={ArrowUpFromLine} indent />
          </SubSection>
        </CollapsibleGroup>

        <CollapsibleGroup label="Reports" icon={BarChart2}>
          <NavItem href="/calls" label="Live Calls" icon={PhoneCall} />
        </CollapsibleGroup>

        <div className="pt-1 border-t border-surface-border mt-1">
          <NavItem href="/settings" label="Settings" icon={Settings} />
        </div>
      </nav>

      <div className="border-t border-surface-border px-4 py-3">
        <p className="font-mono text-[11px] text-zinc-700">Quartz PBX v0.1.0</p>
      </div>
    </aside>
  );
}
