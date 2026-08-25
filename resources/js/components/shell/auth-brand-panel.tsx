import { cn } from '@/lib/cn';
import type { Severity } from '@/types';
import { BrandMark } from './brand-mark';

type PreviewRow = { label: string; answer: string; severity: Severity };

/** Real rows from the blueprint, so the panel shows the tool instead of a slogan. */
const rows: PreviewRow[] = [
    { label: 'Kelengkapan APD petugas', answer: 'Ya', severity: 'ok' },
    { label: 'Tools HCA lengkap', answer: 'Ya', severity: 'ok' },
    { label: 'Sanitasi peralatan sebelum kerja', answer: 'Sudah', severity: 'ok' },
    { label: 'Kelembaban ruangan', answer: 'Di atas standar', severity: 'warn' },
    { label: 'Ceceran grease di area', answer: 'Ada', severity: 'bad' },
    { label: 'Lampu berpelindung', answer: 'Lengkap', severity: 'ok' },
];

const chipTone: Record<Severity, string> = {
    ok: 'bg-ok-soft text-ok',
    warn: 'bg-warn-soft text-warn',
    bad: 'bg-bad-soft text-bad',
};

export function AuthBrandPanel({ className }: { className?: string }) {
    return (
        <div className={cn('flex h-full flex-col justify-between bg-brand p-[clamp(28px,3vw,48px)]', className)}>
            <div className="flex items-center gap-2.5">
                <BrandMark className="bg-white/15" />
                <div>
                    <p className="font-display text-[15px] leading-tight font-semibold text-white">
                        Checklist HCA
                    </p>
                    <p className="text-[11px] text-white/60">Monitoring Maintenance</p>
                </div>
            </div>

            <div className="my-8 w-full max-w-[420px]">
                <div className="overflow-hidden rounded-[10px] border border-white/15 bg-white/5">
                    <div className="flex items-center justify-between gap-3 border-b border-white/15 px-4 py-2.5">
                        <p className="font-display text-[12px] font-semibold tracking-[0.06em] text-white/85 uppercase">
                            Lembar isian
                        </p>
                        <p data-numeric className="text-[11px] text-white/60">
                            Line 2 / Minggu 3
                        </p>
                    </div>
                    <ul className="divide-y divide-white/10">
                        {rows.map((row) => (
                            <li
                                key={row.label}
                                className="flex items-center justify-between gap-3 px-4 py-2.5"
                            >
                                <span className="min-w-0 truncate text-[12.5px] text-white/85">
                                    {row.label}
                                </span>
                                <span
                                    className={cn(
                                        'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
                                        chipTone[row.severity],
                                    )}
                                >
                                    {row.answer}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <div className="border-t border-white/15 px-4 py-2.5">
                        <p className="text-[11px] text-white/55">
                            <span data-numeric>25</span> item lagi di bawah, termasuk suhu cabinet dan
                            catatan temuan.
                        </p>
                    </div>
                </div>
            </div>

            <p className="max-w-[46ch] text-[13px] leading-relaxed text-white/70">
                Isian mingguan tim maintenance untuk area HCA. Semua jawaban tersimpan rapi dan bisa
                diunduh sebagai file Excel bulanan dengan format yang sudah biasa dipakai.
            </p>
        </div>
    );
}
