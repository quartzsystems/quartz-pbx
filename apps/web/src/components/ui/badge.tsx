// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'accent';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  accent:  'bg-accent-500/10 text-accent-400 ring-accent-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 ring-yellow-500/20',
  error:   'bg-red-500/10 text-red-400 ring-red-500/20',
  neutral: 'bg-zinc-700/50 text-zinc-400 ring-zinc-600/20',
};

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
