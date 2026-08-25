import { cn } from '@/lib/cn';
import type { OptionSets, Severity } from '@/types';

export const SEVERITY_LABEL: Record<Severity, string> = {
    ok: 'Sesuai standar',
    warn: 'Perlu perhatian',
    bad: 'Tidak sesuai',
};

/** Tint for a block that carries an answer value. */
export const severityBox: Record<Severity, string> = {
    ok: 'border-ok/40 bg-ok-soft text-ok',
    warn: 'border-warn/40 bg-warn-soft text-warn',
    bad: 'border-bad/40 bg-bad-soft text-bad',
};

/** Solid dot / pill used inside dense tables. */
export const severityPill: Record<Severity, string> = {
    ok: 'bg-ok-soft text-ok ring-ok/30',
    warn: 'bg-warn-soft text-warn ring-warn/30',
    bad: 'bg-bad-soft text-bad ring-bad/30',
};

export function resolveSeverity(
    optionSets: OptionSets,
    optionSet: string | null,
    value: string | null,
): Severity | null {
    if (!optionSet || !value) {
        return null;
    }

    const found = optionSets[optionSet]?.find((option) => option.value === value);

    return found ? found.severity : null;
}

export interface SeverityCounts {
    ok: number;
    warn: number;
    bad: number;
}

const ORDER: Severity[] = ['ok', 'warn', 'bad'];

export function SeverityChips({
    counts,
    className,
}: {
    counts: SeverityCounts;
    className?: string;
}) {
    return (
        <span className={cn('inline-flex items-center gap-1', className)}>
            {ORDER.map((key) => {
                const value = counts[key];

                return (
                    <span
                        key={key}
                        title={`${SEVERITY_LABEL[key]}: ${value} jawaban`}
                        aria-label={`${SEVERITY_LABEL[key]}: ${value} jawaban`}
                        className={cn(
                            'inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 font-mono text-[11px] font-semibold ring-1',
                            value === 0
                                ? 'bg-canvas text-ink-soft ring-line'
                                : severityPill[key],
                        )}
                    >
                        {value}
                    </span>
                );
            })}
        </span>
    );
}

export function SeverityLegend({ className }: { className?: string }) {
    return (
        <p className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft', className)}>
            {ORDER.map((key) => (
                <span key={key} className="inline-flex items-center gap-1.5">
                    <span
                        aria-hidden="true"
                        className={cn('h-2.5 w-2.5 rounded-full ring-1', severityPill[key])}
                    />
                    {SEVERITY_LABEL[key]}
                </span>
            ))}
        </p>
    );
}
