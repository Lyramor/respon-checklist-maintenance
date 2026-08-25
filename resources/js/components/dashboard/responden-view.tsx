import { ActionLink } from '@/components/dashboard/action-link';
import { NextAction } from '@/components/dashboard/next-action';
import { StatRow, StatTile } from '@/components/dashboard/stat-tile';
import { formatTanggalPendek, SubmissionList } from '@/components/dashboard/submission-list';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { routes } from '@/routes';
import type { SubmissionSummary } from '@/types';

export interface RespondenStats {
    total: number;
    this_month: number;
    last: SubmissionSummary | null;
    recent: SubmissionSummary[];
}

/**
 * Dashboard responden. Tidak ada angka milik admin di sini.
 */
export function RespondenView({ mine }: { mine: RespondenStats }) {
    const last = mine.last;

    return (
        <div className="space-y-6">
            <NextAction last={last} thisMonth={mine.this_month} />

            <StatRow>
                <StatTile label="Bulan ini" value={mine.this_month} meta="checklist terkirim" accent />
                <StatTile label="Total isian" value={mine.total} meta="sejak akunmu dibuat" />
                <StatTile
                    label="Terakhir isi"
                    value={last ? formatTanggalPendek(last.tanggal_pemeriksaan) : 'Belum ada'}
                    meta={last ? `Minggu ${last.week} · Line ${last.line}` : 'menunggu isian pertama'}
                />
                <StatTile
                    label="Temuan terakhir"
                    value={last ? last.counts.bad : 'Belum ada'}
                    meta={last ? 'poin bertanda temuan' : 'belum ada data'}
                />
            </StatRow>

            <Card>
                <CardHeader
                    title="Riwayat isianmu"
                    description="Checklist terbaru yang kamu kirim, lengkap dengan minggu, line dan hasilnya."
                    action={
                        <ActionLink href={routes.checklist.create()} variant="secondary" size="sm">
                            Isi lagi
                        </ActionLink>
                    }
                />
                <CardBody>
                    <SubmissionList
                        items={mine.recent}
                        emptyTitle="Belum ada checklist yang kamu kirim"
                        emptyDescription="Isian pertamamu akan muncul di sini beserta minggu, line, tanggal pemeriksaan dan jumlah temuannya."
                        emptyAction={<ActionLink href={routes.checklist.create()}>Mulai isi checklist</ActionLink>}
                    />
                </CardBody>
            </Card>
        </div>
    );
}
