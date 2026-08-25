import type { ReactNode } from 'react';
import { Field } from '@/components/ui/field';
import { cn } from '@/lib/cn';
import { rowId } from './focus';

interface ItemRowProps {
    itemKey: string;
    code: string;
    label: string;
    hint?: string;
    required?: boolean;
    error?: string;
    className?: string;
    children: ReactNode;
}

/**
 * Satu baris item checklist: penanda urutan di kiri, label panjang tetap terbaca,
 * kontrol dan pesan error ditangani oleh primitive Field.
 */
export function ItemRow({ itemKey, code, label, hint, required, error, className, children }: ItemRowProps) {
    return (
        <div
            id={rowId(itemKey)}
            className={cn(
                'flex scroll-mt-24 gap-3 border-b border-line/70 py-4 last:border-b-0 sm:gap-4',
                error ? 'bg-bad-soft/25' : null,
                className,
            )}
        >
            <span className="mt-[3px] w-8 shrink-0 font-mono text-[11px] tabular-nums text-ink-soft">{code}</span>
            <div className="min-w-0 flex-1">
                <Field label={label} htmlFor={itemKey} hint={hint} error={error} required={required}>
                    {children}
                </Field>
            </div>
        </div>
    );
}
