import { Download, Trash2 } from 'lucide-react';

import { EmptyState } from '@/components/ui/empty-state';
import { TBody, TD, TH, THead, TR, Table } from '@/components/ui/table';
import { routes } from '@/routes';
import type { ReportExport } from '@/types';

export function ReportHistoryTable({
    exports,
    onDelete,
}: {
    exports: ReportExport[];
    onDelete: (item: ReportExport) => void;
}) {
    if (exports.length === 0) {
        return (
            <div className="p-4">
                <EmptyState
                    title="Belum ada file laporan"
                    description="Pilih bulan dan tahun pada panel export di atas, lalu tekan Export laporan. File hasilnya tersimpan di sini dan bisa diunduh ulang kapan saja."
                />
            </div>
        );
    }

    return (
        <Table>
            <THead>
                <TR>
                    <TH className="whitespace-nowrap">Periode</TH>
                    <TH>Nama file</TH>
                    <TH className="whitespace-nowrap">Checklist</TH>
                    <TH className="whitespace-nowrap">Ukuran</TH>
                    <TH>Dibuat oleh</TH>
                    <TH className="whitespace-nowrap">Waktu dibuat</TH>
                    <TH className="text-right">Aksi</TH>
                </TR>
            </THead>

            <TBody>
                {exports.map((item) => (
                    <TR key={item.id}>
                        <TD className="font-medium whitespace-nowrap text-ink">{item.label}</TD>
                        <TD className="font-mono text-xs">
                            <span
                                className="block max-w-[280px] truncate"
                                title={item.filename}
                            >
                                {item.filename}
                            </span>
                        </TD>
                        <TD className="font-mono text-xs">{item.submissions_count}</TD>
                        <TD className="font-mono text-xs whitespace-nowrap">{item.size_label}</TD>
                        <TD className="text-ink-soft">{item.created_by ?? 'Tidak diketahui'}</TD>
                        <TD className="font-mono text-xs whitespace-nowrap">{item.created_at}</TD>
                        <TD className="whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                                <a
                                    href={routes.admin.reportDownload(item.id)}
                                    download={item.filename}
                                    className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-xs font-medium text-brand hover:bg-brand-soft"
                                >
                                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                    Unduh
                                </a>

                                <button
                                    type="button"
                                    onClick={() => onDelete(item)}
                                    className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-xs font-medium text-bad hover:bg-bad-soft"
                                >
                                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                    Hapus
                                </button>
                            </div>
                        </TD>
                    </TR>
                ))}
            </TBody>
        </Table>
    );
}
