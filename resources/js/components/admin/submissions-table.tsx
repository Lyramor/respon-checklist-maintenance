import { Link } from '@inertiajs/react';

import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TBody, TD, TH, THead, TR, Table } from '@/components/ui/table';
import { routes } from '@/routes';
import type { SubmissionSummary } from '@/types';

import { SeverityChips } from './severity';

export function SubmissionsTable({
    rows,
    filtered,
}: {
    rows: SubmissionSummary[];
    filtered: boolean;
}) {
    if (rows.length === 0) {
        return (
            <div className="p-4">
                <EmptyState
                    title={
                        filtered
                            ? 'Tidak ada checklist yang cocok'
                            : 'Belum ada checklist yang masuk'
                    }
                    description={
                        filtered
                            ? 'Coba longgarkan saringan minggu, line, atau bulan, atau kosongkan kata kunci pencarian.'
                            : 'Hasil pengisian dari petugas akan tampil di sini lengkap dengan ringkasan temuannya.'
                    }
                    action={
                        filtered ? undefined : (
                            <Link
                                href={routes.checklist.create()}
                                className="inline-flex items-center rounded-[4px] border border-brand bg-brand px-3.5 py-2 text-sm font-medium text-surface hover:bg-brand-ink"
                            >
                                Isi checklist sekarang
                            </Link>
                        )
                    }
                />
            </div>
        );
    }

    return (
        <Table>
            <THead>
                <TR>
                    <TH className="whitespace-nowrap">Minggu</TH>
                    <TH className="whitespace-nowrap">Line</TH>
                    <TH>Nama petugas</TH>
                    <TH className="whitespace-nowrap">Tanggal</TH>
                    <TH>Diisi oleh</TH>
                    <TH className="whitespace-nowrap">Temuan</TH>
                    <TH className="text-right">Aksi</TH>
                </TR>
            </THead>

            <TBody>
                {rows.map((row) => (
                    <TR key={row.id}>
                        <TD className="font-mono text-xs whitespace-nowrap">M{row.week}</TD>
                        <TD className="whitespace-nowrap">
                            <Badge tone="brand">LINE {row.line}</Badge>
                        </TD>
                        <TD className="font-medium text-ink">{row.nama_petugas}</TD>
                        <TD className="font-mono text-xs whitespace-nowrap">
                            {row.tanggal_pemeriksaan}
                        </TD>
                        <TD className="text-ink-soft">{row.author ?? 'Tidak diketahui'}</TD>
                        <TD>
                            <SeverityChips counts={row.counts} />
                        </TD>
                        <TD className="text-right whitespace-nowrap">
                            <Link
                                href={routes.admin.submission(row.id)}
                                className="rounded-[4px] px-2 py-1 text-xs font-medium text-brand hover:bg-brand-soft"
                            >
                                Lihat detail
                            </Link>
                        </TD>
                    </TR>
                ))}
            </TBody>
        </Table>
    );
}
