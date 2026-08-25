import { Check } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';

import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/cn';

import { LINES, WEEKS } from './constants';

export interface CoverageSlot {
    week: number;
    line: number;
    filled: boolean;
    author: string | null;
}

function slotOf(coverage: CoverageSlot[], week: number, line: number): CoverageSlot | undefined {
    return coverage.find((slot) => slot.week === week && slot.line === line);
}

const GRID = 'grid grid-cols-[76px_repeat(5,minmax(112px,1fr))] gap-px bg-line';

export function CoverageGrid({
    coverage,
    periodLabel,
    action,
}: {
    coverage: CoverageSlot[];
    periodLabel: string;
    action?: ReactNode;
}) {
    const total = WEEKS.length * LINES.length;
    const filled = coverage.filter((slot) => slot.filled).length;
    const percent = total === 0 ? 0 : Math.round((filled / total) * 100);

    return (
        <Card>
            <CardHeader
                title={`Cakupan pengisian ${periodLabel}`}
                description="Satu kotak sama dengan satu kolom di laporan Excel. Minggu ke bawah, line ke samping."
                action={action}
            />

            <CardBody className="space-y-4">
                <div className="-mx-1 overflow-x-auto px-1 pb-1">
                    <div className={cn(GRID, 'min-w-[660px] rounded-[6px] border border-line')}>
                        <div className="bg-brand px-3 py-2 font-display text-[11px] font-semibold tracking-wide text-surface/80 uppercase">
                            Line
                        </div>
                        {WEEKS.map((week) => (
                            <div
                                key={`head-${week}`}
                                className="bg-brand px-3 py-2 text-center font-display text-[11px] font-semibold tracking-wide text-surface uppercase"
                            >
                                Minggu {week}
                            </div>
                        ))}

                        {LINES.map((line) => {
                            const lineFilled = coverage.filter(
                                (slot) => slot.line === line && slot.filled,
                            ).length;

                            return (
                                <Fragment key={`row-${line}`}>
                                    <div className="flex flex-col justify-center bg-brand-soft px-3 py-2">
                                        <span className="font-display text-sm font-semibold text-brand">
                                            LINE {line}
                                        </span>
                                        <span className="font-mono text-[10px] text-ink-soft">
                                            {lineFilled}/{WEEKS.length}
                                        </span>
                                    </div>

                                    {WEEKS.map((week) => (
                                        <CoverageCell
                                            key={`cell-${line}-${week}`}
                                            slot={slotOf(coverage, week, line)}
                                        />
                                    ))}
                                </Fragment>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-ink-soft">
                        <span className="font-mono font-semibold text-ink">
                            {filled}/{total}
                        </span>{' '}
                        slot sudah diisi bulan ini.{' '}
                        {filled === total
                            ? 'Semua minggu dan line lengkap.'
                            : `Sisa ${total - filled} slot menunggu pengisian.`}
                    </p>

                    <div
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Persentase slot terisi"
                        className="h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-canvas ring-1 ring-line"
                    >
                        <div
                            className="h-full bg-brand transition-[width] duration-500"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}

function CoverageCell({ slot }: { slot: CoverageSlot | undefined }) {
    if (!slot?.filled) {
        return (
            <div className="flex min-h-[62px] flex-col justify-center bg-surface px-3 py-2">
                <span className="text-xs text-ink-soft/70">Belum diisi</span>
            </div>
        );
    }

    return (
        <div className="flex min-h-[62px] flex-col justify-center gap-1 bg-brand-soft px-3 py-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Terisi
            </span>
            <span className="truncate text-xs text-ink" title={slot.author ?? undefined}>
                {slot.author ?? 'Tanpa nama'}
            </span>
        </div>
    );
}
