// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CreateInboundRouteDto, InboundRoute } from '@/lib/types';
import { cn } from '@/lib/utils';

interface InboundRouteFormProps {
  defaultValues?: Partial<InboundRoute>;
  onSubmit: (data: CreateInboundRouteDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const DEST_TYPES = [
  { value: 'extension', label: 'Extension',    hint: 'Route to an internal extension number' },
  { value: 'context',   label: 'Context',      hint: 'Jump to a custom dialplan context' },
];

export function InboundRouteForm({ defaultValues, onSubmit, onCancel, loading }: InboundRouteFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateInboundRouteDto>({
    defaultValues: {
      name:            defaultValues?.name            ?? '',
      did:             defaultValues?.did             ?? '',
      cidNumber:       defaultValues?.cidNumber       ?? '',
      destination:     defaultValues?.destination     ?? '',
      destinationType: defaultValues?.destinationType ?? 'extension',
      priority:        defaultValues?.priority        ?? 0,
    },
  });

  const destType = watch('destinationType');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Route Name"
        placeholder="Main Office Line"
        required
        error={errors.name?.message}
        {...register('name', { required: 'Route name is required' })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="DID (Inbound Number)"
          placeholder="5551234567"
          hint="Leave blank to match all incoming calls"
          error={errors.did?.message}
          {...register('did')}
        />
        <Input
          label="Caller ID Match"
          placeholder="5559876543"
          hint="Optional — match a specific caller ID"
          error={errors.cidNumber?.message}
          {...register('cidNumber')}
        />
      </div>

      {/* Destination type */}
      <div className="space-y-1.5">
        <span className="block text-xs font-medium uppercase tracking-wide text-zinc-400">
          Destination Type<span className="ml-0.5 text-accent-500">*</span>
        </span>
        <div className="grid grid-cols-2 gap-2">
          {DEST_TYPES.map(({ value, label, hint }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('destinationType', value)}
              className={cn(
                'flex flex-col items-start rounded-lg border p-3 text-left transition-colors',
                destType === value
                  ? 'border-accent-500 bg-accent-500/10 text-accent-400'
                  : 'border-surface-border bg-surface-input text-zinc-400 hover:border-zinc-600 hover:text-zinc-200',
              )}
            >
              <span className="text-sm font-semibold">{label}</span>
              <span className="mt-0.5 text-[11px] leading-snug opacity-70">{hint}</span>
            </button>
          ))}
        </div>
        <input type="hidden" {...register('destinationType')} />
      </div>

      <Input
        label={destType === 'extension' ? 'Destination Extension' : 'Destination Context'}
        placeholder={destType === 'extension' ? '1001' : 'my-ivr-context'}
        required
        error={errors.destination?.message}
        hint={
          destType === 'extension'
            ? 'Extension number to send this call to'
            : 'Dialplan context name (calls go to s,1 in that context)'
        }
        {...register('destination', { required: 'Destination is required' })}
      />

      <Input
        label="Priority"
        type="number"
        placeholder="0"
        hint="Lower number = matched first. Use 0 for the default catch-all."
        error={errors.priority?.message}
        {...register('priority', { valueAsNumber: true })}
      />

      <div className="flex justify-end gap-3 border-t border-surface-border pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading}>
          {defaultValues?.id ? 'Save Changes' : 'Create Route'}
        </Button>
      </div>
    </form>
  );
}
