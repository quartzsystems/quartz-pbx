// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CreateExtensionDto, Extension } from '@/lib/types';

interface ExtensionFormProps {
  defaultValues?: Partial<Extension>;
  onSubmit: (data: CreateExtensionDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ExtensionForm({ defaultValues, onSubmit, onCancel, loading }: ExtensionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateExtensionDto>({
    defaultValues: {
      extension: defaultValues?.extension ?? '',
      name: defaultValues?.name ?? '',
      password: defaultValues?.password ?? '',
      email: defaultValues?.email ?? '',
      callerId: defaultValues?.callerId ?? '',
      voicemail: defaultValues?.voicemail ?? false,
      context: defaultValues?.context ?? 'from-internal',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Extension Number"
          placeholder="1001"
          required
          error={errors.extension?.message}
          {...register('extension', {
            required: 'Extension number is required',
            pattern: { value: /^\d{2,6}$/, message: 'Must be 2–6 digits' },
          })}
        />
        <Input
          label="Display Name"
          placeholder="John Smith"
          required
          error={errors.name?.message}
          {...register('name', { required: 'Display name is required' })}
        />
      </div>

      <Input
        label="SIP Password"
        type="password"
        placeholder="Strong secret"
        required
        error={errors.password?.message}
        hint="Used for SIP device authentication"
        {...register('password', {
          required: 'Password is required',
          minLength: { value: 8, message: 'Minimum 8 characters' },
        })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Caller ID Override"
          placeholder='"John" <1001>'
          error={errors.callerId?.message}
          hint="Leave blank to use display name"
          {...register('callerId')}
        />
      </div>

      <Input
        label="Dialplan Context"
        placeholder="from-internal"
        error={errors.context?.message}
        {...register('context')}
      />

      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-300">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-surface-border bg-surface-input accent-accent-500 focus:ring-accent-500"
          {...register('voicemail')}
        />
        Enable voicemail for this extension
      </label>

      <div className="flex justify-end gap-3 border-t border-surface-border pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {defaultValues?.id ? 'Save Changes' : 'Create Extension'}
        </Button>
      </div>
    </form>
  );
}
