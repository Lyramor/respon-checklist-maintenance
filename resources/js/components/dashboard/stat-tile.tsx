import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface StatTileProps {
    label: string;
    value: ReactNode;
    meta?: string;
    accent?: boolean;
    className?: string;
}

/**
 * Angka operasional tunggal. Dipakai berderet dalam StatRow,
 * tetap dua kolom di layar kecil supaya papan tetap padat.
 */
export function StatTile({ label, value, meta, accent = false, className }: StatTileProps) {
    return (
        <div
            className={cn(
                'flex flex-col justify-between gap-2 rounded-[10px] border border-line bg-surface p-4',
                accent && 'border-brand/30 bg-brand-soft',
                className,
            )}
        >
            <span className="font-display text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-soft">
                {label}
            </span>
            <span className="font-display text-[clamp(24px,4.4vw,32px)] font-semibold leading-none tabular-nums text-ink">
                {value}
            </span>
            {meta ? <span className="text-xs leading-snug text-ink-soft">{meta}</span> : null}
        </div>
    );
}

export function StatRow({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('grid grid-cols-2 gap-3 lg:grid-cols-4', className)}>{children}</div>;
}
