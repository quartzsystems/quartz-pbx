// Copyright (C), 2026 Quartz Systems. Some rights reserved. This work is
// licensed under the terms of the MIT license which can be found in the
// root directory of this project.

'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import type { CreateOutboundRouteDto, OutboundRoute, TrunkType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface OutboundRouteFormProps {
  defaultValues?: OutboundRoute;
  onSubmit: (data: CreateOutboundRouteDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface FormValues {
  name: string;
  callerId: string;
  prepend: string;
  stripDigits: number;
  priority: number;
  patterns: { value: string }[];
  trunkIds: { id: string }[];
}

const PATTERN_PRESETS = [
  { pattern: '_NXXNXXXXXX',  label: '10-digit US' },
  { pattern: '_1NXXNXXXXXX', label: '11-digit US' },
  { pattern: '_011.',        label: 'International' },
  { pattern: '_X.',          label: 'Match all' },
];

const TYPE_VARIANT: Record<TrunkType, 'accent' | 'neutral' | 'warning'> = {
  PJSIP: 'accent', SIP: 'neutral', IAX2: 'warning',
};

export function OutboundRouteForm({ defaultValues, onSubmit, onCancel, loading }: OutboundRouteFormProps) {
  const { data: trunks = [] } = useQuery({
    queryKey: ['trunks'],
    queryFn: () => api.trunks.list(),
  });

  const { register, handleSubmit, control, watch, formState: { errors } } =
    useForm<FormValues>({
      defaultValues: {
        name:        defaultValues?.name        ?? '',
        callerId:    defaultValues?.callerId    ?? '',
        prepend:     defaultValues?.prepend     ?? '',
        stripDigits: defaultValues?.stripDigits ?? 0,
        priority:    defaultValues?.priority    ?? 0,
        patterns:    defaultValues?.patterns.map((p) => ({ value: p.pattern })) ?? [{ value: '' }],
        trunkIds:    defaultValues?.trunks.map((t) => ({ id: t.trunk.id }))     ?? [],
      },
    });

  const patternsField = useFieldArray({ control, name: 'patterns' });
  const trunksField   = useFieldArray({ control, name: 'trunkIds' });

  const watchedTrunkIds = watch('trunkIds');

  function getTrunk(id: string) {
    return trunks.find((t) => t.id === id);
  }

  function moveTrunk(index: number, dir: number) {
    const next = index + dir;
    if (next < 0 || next >= trunksField.fields.length) return;
    trunksField.swap(index, next);
  }

  async function handleSubmitForm(values: FormValues) {
    await onSubmit({
      name:        values.name,
      callerId:    values.callerId || undefined,
      prepend:     values.prepend  || undefined,
      stripDigits: values.stripDigits,
      priority:    values.priority,
      patterns:    values.patterns.map((p) => p.value).filter(Boolean),
      trunkIds:    values.trunkIds.map((t) => t.id).filter(Boolean),
    });
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-5">

      <Input
        label="Route Name"
        placeholder="Local Calls"
        required
        error={errors.name?.message}
        {...register('name', { required: 'Route name is required' })}
      />

      {/* Dial Patterns */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Dial Patterns<span className="ml-0.5 text-accent-500">*</span>
          </span>
          <Button
            type="button" size="sm" variant="ghost"
            onClick={() => patternsField.append({ value: '' })}
          >
            <Plus className="h-3.5 w-3.5" /> Add Pattern
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PATTERN_PRESETS.map(({ pattern, label }) => (
            <button
              key={pattern}
              type="button"
              onClick={() => patternsField.append({ value: pattern })}
              className="rounded border border-surface-border bg-surface-elevated px-2 py-0.5 text-[11px] text-zinc-400 transition-colors hover:border-accent-500 hover:text-accent-400"
            >
              {pattern} <span className="text-zinc-600">— {label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {patternsField.fields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                placeholder="_NXXNXXXXXX"
                className={cn(
                  'flex-1 rounded-md border border-surface-border bg-surface-input px-3 py-2',
                  'font-mono text-sm text-zinc-100 placeholder:text-zinc-600',
                  'focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500',
                )}
                {...register(`patterns.${i}.value`, { required: true })}
              />
              <Button
                type="button" size="sm" variant="ghost"
                className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
                onClick={() => patternsField.remove(i)}
                disabled={patternsField.fields.length === 1}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
        {patternsField.fields.length === 0 && (
          <p className="text-xs text-red-400">At least one dial pattern is required.</p>
        )}
      </div>

      {/* Caller ID */}
      <Input
        label="Outbound Caller ID"
        placeholder={'"My Business" <5551234567>'}
        hint="Override the caller ID sent to the provider. Leave blank to use the extension's own CID."
        error={errors.callerId?.message}
        {...register('callerId')}
      />

      {/* Trunk Failover Order */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Trunk Failover Order
          </span>
          <select
            className="rounded-md border border-surface-border bg-surface-input px-3 py-1.5 text-xs text-zinc-300 focus:border-accent-500 focus:outline-none"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                trunksField.append({ id: e.target.value });
                e.target.value = '';
              }
            }}
          >
            <option value="">+ Add trunk...</option>
            {trunks
              .filter((t) => !watchedTrunkIds.some((w) => w.id === t.id))
              .map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.type}] {t.name} — {t.host}
                </option>
              ))}
          </select>
        </div>

        {trunksField.fields.length === 0 ? (
          <p className="rounded-lg border border-dashed border-surface-border py-4 text-center text-xs text-zinc-600">
            No trunks added — select one above
          </p>
        ) : (
          <div className="space-y-1.5">
            {trunksField.fields.map((field, i) => {
              const trunk = getTrunk(watchedTrunkIds[i]?.id ?? '');
              return (
                <div
                  key={field.id}
                  className="flex items-center gap-3 rounded-lg border border-surface-border bg-surface-elevated px-3 py-2"
                >
                  <span className="w-5 text-center text-xs font-bold text-zinc-600">
                    {i + 1}
                  </span>
                  {trunk ? (
                    <div className="flex flex-1 items-center gap-2">
                      <Badge variant={TYPE_VARIANT[trunk.type] ?? 'neutral'}>{trunk.type}</Badge>
                      <span className="text-sm text-zinc-200">{trunk.name}</span>
                      <span className="font-mono text-xs text-zinc-500">{trunk.host}</span>
                    </div>
                  ) : (
                    <span className="flex-1 text-xs text-zinc-600">Unknown trunk</span>
                  )}
                  <input type="hidden" {...register(`trunkIds.${i}.id`)} />
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveTrunk(i, -1)}
                      disabled={i === 0}
                      className="rounded p-1 text-zinc-500 hover:bg-surface-card hover:text-zinc-300 disabled:opacity-30"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveTrunk(i, 1)}
                      disabled={i === trunksField.fields.length - 1}
                      className="rounded p-1 text-zinc-500 hover:bg-surface-card hover:text-zinc-300 disabled:opacity-30"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => trunksField.remove(i)}
                      className="rounded p-1 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            {trunksField.fields.length > 1 && (
              <p className="text-xs text-zinc-600">
                Trunks are tried top-to-bottom. If trunk 1 fails, Asterisk dials trunk 2, and so on.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Digit manipulation + priority */}
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Prepend Digits"
          placeholder="1"
          hint="Add digits before dialing"
          {...register('prepend')}
        />
        <Input
          label="Strip Digits"
          type="number"
          placeholder="0"
          hint="Remove from front of number"
          {...register('stripDigits', { valueAsNumber: true })}
        />
        <Input
          label="Route Priority"
          type="number"
          placeholder="0"
          hint="Lower = matched first"
          {...register('priority', { valueAsNumber: true })}
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-surface-border pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={loading}>
          {defaultValues?.id ? 'Save Changes' : 'Create Route'}
        </Button>
      </div>
    </form>
  );
}
