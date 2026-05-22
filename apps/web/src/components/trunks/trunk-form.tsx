// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CreateTrunkDto, Trunk, TrunkType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TrunkFormProps {
  defaultValues?: Partial<Trunk>;
  onSubmit: (data: CreateTrunkDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const TRUNK_TYPES: { value: TrunkType; label: string; description: string }[] = [
  { value: 'PJSIP', label: 'PJSIP',  description: 'chan_pjsip — recommended for new deployments' },
  { value: 'SIP',   label: 'SIP',    description: 'chan_sip — legacy SIP driver' },
  { value: 'IAX2',  label: 'IAX2',   description: 'chan_iax2 — inter-Asterisk protocol' },
];

export function TrunkForm({ defaultValues, onSubmit, onCancel, loading }: TrunkFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTrunkDto>({
    defaultValues: {
      type:     defaultValues?.type    ?? 'PJSIP',
      name:     defaultValues?.name    ?? '',
      host:     defaultValues?.host    ?? '',
      username: defaultValues?.username ?? '',
      password: defaultValues?.password ?? '',
      context:  defaultValues?.context  ?? 'from-trunk',
      codecs:   defaultValues?.codecs   ?? 'ulaw,alaw,g722',
      register: defaultValues?.register ?? true,
    },
  });

  const selectedType = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Trunk type selector */}
      <div className="space-y-1.5">
        <span className="block text-xs font-medium uppercase tracking-wide text-zinc-400">
          Trunk Type<span className="ml-0.5 text-accent-500">*</span>
        </span>
        <div className="grid grid-cols-3 gap-2">
          {TRUNK_TYPES.map(({ value, label, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('type', value)}
              className={cn(
                'flex flex-col items-start rounded-lg border p-3 text-left transition-colors',
                selectedType === value
                  ? 'border-accent-500 bg-accent-500/10 text-accent-400'
                  : 'border-surface-border bg-surface-input text-zinc-400 hover:border-zinc-600 hover:text-zinc-200',
              )}
            >
              <span className="text-sm font-semibold">{label}</span>
              <span className="mt-0.5 text-[11px] leading-snug opacity-70">{description}</span>
            </button>
          ))}
        </div>
        {/* hidden input for form registration */}
        <input type="hidden" {...register('type')} />
      </div>

      <Input
        label="Trunk Name"
        placeholder="twilio-main"
        required
        error={errors.name?.message}
        hint="Internal identifier — letters, numbers, hyphens only"
        {...register('name', {
          required: 'Trunk name is required',
          pattern: { value: /^[\w-]+$/, message: 'Letters, numbers, hyphens only' },
        })}
      />

      <Input
        label="Host / Provider"
        placeholder="sip.twilio.com"
        required
        error={errors.host?.message}
        {...register('host', { required: 'Host is required' })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Username"
          placeholder="ACxxxxxxxx"
          required
          error={errors.username?.message}
          {...register('username', { required: 'Username is required' })}
        />
        <Input
          label="Password"
          type="password"
          placeholder="SIP credential"
          required
          error={errors.password?.message}
          {...register('password', { required: 'Password is required' })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Dialplan Context"
          placeholder="from-trunk"
          error={errors.context?.message}
          {...register('context')}
        />
        <Input
          label="Allowed Codecs"
          placeholder="ulaw,alaw,g722"
          error={errors.codecs?.message}
          hint="Comma-separated"
          {...register('codecs')}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-300">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-surface-border bg-surface-input accent-accent-500"
          {...register('register')}
        />
        Send SIP REGISTER to provider
      </label>

      <div className="flex justify-end gap-3 border-t border-surface-border pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading}>
          {defaultValues?.id ? 'Save Changes' : 'Create Trunk'}
        </Button>
      </div>
    </form>
  );
}
