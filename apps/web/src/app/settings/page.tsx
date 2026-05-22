// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import { PageHeader } from '@/components/layout/page-header';

export const metadata = { title: 'Settings — Quartz PBX' };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="System configuration" />
      <div className="rounded-xl border border-surface-border bg-surface-card p-6 shadow-sm">
        <p className="text-sm text-gray-500">Settings coming soon.</p>
      </div>
    </div>
  );
}
