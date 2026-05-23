// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-zinc-50">{title}</h1>
        {description && <p className="font-mono text-[13px] text-zinc-500">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 gap-2">{action}</div>}
    </div>
  );
}
