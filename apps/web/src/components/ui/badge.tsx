// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'accent';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  accent:  'bg-accent-500/14 border-accent-500/38 text-accent-400',
  success: 'bg-accent-500/14 border-accent-500/38 text-accent-500',
  warning: 'bg-status-warn/14 border-status-warn/38 text-status-warn',
  error:   'bg-status-danger/14 border-status-danger/38 text-status-danger',
  info:    'bg-status-info/14 border-status-info/38 text-status-info',
  neutral: 'bg-surface-input border-surface-border text-zinc-400',
};

const dotColors: Record<BadgeVariant, string> = {
  accent:  'bg-accent-500',
  success: 'bg-accent-500',
  warning: 'bg-status-warn',
  error:   'bg-status-danger',
  info:    'bg-status-info',
  neutral: 'bg-zinc-600',
};

export function Badge({ variant = 'neutral', dot, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10.5px] font-semibold tracking-[0.06em]',
        variantClasses[variant],
        className,
      )}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
