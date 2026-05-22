// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import { PageHeader } from '@/components/layout/page-header';
import { InboundRouteTable } from '@/components/inbound-routes/inbound-route-table';

export const metadata = { title: 'Inbound Routes — Quartz PBX' };

export default function InboundRoutesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inbound Routes"
        description="Match incoming DIDs and caller IDs to extensions or dialplan destinations"
      />
      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <InboundRouteTable />
      </div>
    </div>
  );
}
