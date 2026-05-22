// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import { PageHeader } from '@/components/layout/page-header';
import { OutboundRouteTable } from '@/components/outbound-routes/outbound-route-table';

export const metadata = { title: 'Outbound Routes — Quartz PBX' };

export default function OutboundRoutesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Outbound Routes"
        description="Match dial patterns to trunks — routes are evaluated in priority order"
      />
      <div className="rounded-xl border border-surface-border bg-surface-card p-6">
        <OutboundRouteTable />
      </div>
    </div>
  );
}
