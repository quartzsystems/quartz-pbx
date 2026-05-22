// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import { PageHeader } from '@/components/layout/page-header';
import { TrunkTable } from '@/components/trunks/trunk-table';

export const metadata = { title: 'Trunks — Quartz PBX' };

export default function TrunksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Trunks"
        description="Configure SIP, PJSIP, and IAX2 upstream provider connections"
      />
      <div className="rounded-xl border border-surface-border bg-surface-card p-6 shadow-sm">
        <TrunkTable />
      </div>
    </div>
  );
}
