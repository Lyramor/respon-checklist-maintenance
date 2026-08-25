import { ArrowRight } from 'lucide-react';

import { ActionLink } from '@/components/dashboard/action-link';
import { formatTanggal } from '@/components/dashboard/submission-list';
import { routes } from '@/routes';
import type { SubmissionSummary } from '@/types';

interface NextActionProps {
    last: SubmissionSummary | null;
    thisMonth: number;
}

/**
 * Panel utama responden. Tugasnya satu: mengantar orang ke form secepat mungkin.
 */
export function NextAction({ last, thisMonth }: NextActionProps) {
    return (
        <div className="rounded-[10px] border border-brand/30 bg-brand-soft p-5 sm:p-6">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.09em] text-brand">
                Tugas kamu
            </p>

            <h2 className="mt-2 font-display text-[clamp(20px,3.4vw,26px)] font-semibold leading-tight text-ink">
                Isi checklist monitoring maintenance
            </h2>

            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-ink-soft">
                Tentukan minggu, line dan tanggal pemeriksaan, lalu jawab seluruh poin sampai bagian kondisi ruangan.
                Isian tersimpan atas nama akunmu dan langsung masuk ke laporan bulanan admin.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <ActionLink href={routes.checklist.create()}>
                    Mulai isi checklist
                    <ArrowRight className="size-4" aria-hidden="true" />
                </ActionLink>

                <p className="text-xs text-ink-soft">
                    {last
                        ? `Terakhir kamu kirim ${formatTanggal(last.tanggal_pemeriksaan)} untuk Minggu ${last.week} Line ${last.line}.`
                        : 'Kamu belum pernah mengirim checklist lewat aplikasi ini.'}
                </p>
            </div>

            {thisMonth > 0 ? (
                <p className="mt-4 border-t border-brand/20 pt-3 text-xs text-ink-soft">
                    Bulan ini sudah {thisMonth} isian dari akunmu. Kirim lagi kalau minggu atau line yang kamu tangani
                    belum tercatat.
                </p>
            ) : null}
        </div>
    );
}
