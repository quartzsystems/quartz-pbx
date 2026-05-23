// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-zinc-500">
            {label}
            {props.required && <span className="ml-0.5 text-accent-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'block w-full rounded-md border border-surface-border bg-surface-input px-3 py-2 text-sm text-zinc-100',
            'placeholder:text-zinc-600',
            'focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500',
            'disabled:cursor-not-allowed disabled:bg-surface-card disabled:text-zinc-600',
            'transition-colors',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-zinc-600">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
