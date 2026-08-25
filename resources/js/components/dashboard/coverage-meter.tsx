import { cn } from '@/lib/cn';

interface CoverageMeterProps {
    filled: number;
    total: number;
    periodLabel: string;
    className?: string;
}

/**
 * Progres pengisian satu periode: berapa slot minggu x line yang sudah masuk.
 * Satu warna brand di atas garis netral, tanpa animasi.
 */
export function CoverageMeter({ filled, total, periodLabel, className }: CoverageMeterProps) {
    const safeTotal = Math.max(total, 0);
    const safeFilled = Math.min(Math.max(filled, 0), safeTotal);
    const percent = safeTotal > 0 ? Math.round((safeFilled / safeTotal) * 100) : 0;
    const sisa = safeTotal - safeFilled;

    return (
        <div className={cn('space-y-3', className)}>
            <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-[28px] font-semibold leading-none tabular-nums text-ink">
                    {safeFilled}
                    <span className="text-ink-soft">/{safeTotal}</span>
                </span>
                <span className="font-mono text-sm tabular-nums text-brand">{percent}%</span>
            </div>

            <div
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Cakupan checklist ${periodLabel}`}
                className="h-2 w-full overflow-hidden rounded-full bg-line"
            >
                <div className="h-full rounded-full bg-brand" style={{ width: `${percent}%` }} />
            </div>

            <p className="text-xs leading-relaxed text-ink-soft">
                {safeTotal === 0
                    ? `Belum ada slot minggu dan line yang dijadwalkan untuk ${periodLabel}.`
                    : sisa === 0
                      ? `Semua slot minggu dan line di ${periodLabel} sudah terisi.`
                      : `${sisa} slot minggu dan line di ${periodLabel} masih kosong.`}
            </p>
        </div>
    );
}
