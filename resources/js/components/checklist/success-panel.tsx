import { router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { routes } from '@/routes';
import { formatTanggal, lineLabel, weekLabel } from './format';

export interface SuccessSummary {
    nama_petugas: string;
    tanggal_pemeriksaan: string;
    week: number;
    line: number;
}

interface SuccessPanelProps {
    summary: SuccessSummary | null;
}

export function SuccessPanel({ summary }: SuccessPanelProps) {
    return (
        <Card>
            <CardHeader
                title="Checklist tersimpan"
                description="Data sudah masuk ke basis data dan admin menerima pemberitahuan."
                action={<Badge tone="ok">Terkirim</Badge>}
            />

            <CardBody className="grid gap-5">
                {summary === null ? (
                    <p className="text-[14px] leading-relaxed text-ink-soft">
                        Rincian isian tidak ditampilkan di halaman ini karena halaman dibuka ulang tanpa data kiriman.
                        Isian terakhir tetap tersimpan dan bisa dilihat pada riwayat di dashboard.
                    </p>
                ) : (
                    <dl className="divide-y divide-line rounded-[10px] border border-line">
                        <RecapRow label="Nama petugas" value={summary.nama_petugas} />
                        <RecapRow label="Tanggal pemeriksaan" value={formatTanggal(summary.tanggal_pemeriksaan)} />
                        <RecapRow label="Week" value={weekLabel(summary.week)} />
                        <RecapRow label="Line" value={lineLabel(summary.line)} />
                    </dl>
                )}

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="button" variant="primary" onClick={() => router.visit(routes.checklist.create())}>
                        Isi checklist lagi
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => router.visit(routes.dashboard())}>
                        Kembali ke dashboard
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
}

function RecapRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
            <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">{label}</dt>
            <dd className="text-[15px] font-medium text-ink">{value}</dd>
        </div>
    );
}
