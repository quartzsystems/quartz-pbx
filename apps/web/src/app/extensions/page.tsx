// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import { PageHeader } from '@/components/layout/page-header';
import { ExtensionTable } from '@/components/extensions/extension-table';

export const metadata = { title: 'Extensions — Quartz PBX' };

export default function ExtensionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Extensions"
        description="Manage PJSIP endpoints for your phones and softphones"
      />
      <div className="rounded-xl border border-surface-border bg-surface-card p-6 shadow-sm">
        <ExtensionTable />
      </div>
    </div>
  );
}
