import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { Severity } from '@/types';
import { SEVERITY_LABEL, type ChecklistStats } from './checklist-stats';
import { formatTanggal, lineLabel, weekLabel } from './format';
import type { IdentityValues } from './identity-panel';

interface ConfirmSubmitModalProps {
    open: boolean;
    stats: ChecklistStats;
    identity: IdentityValues;
    processing: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onFixBlanks: () => void;
}

const SEVERITIES: Severity[] = ['ok', 'warn', 'bad'];

export function ConfirmSubmitModal({
    open,
    stats,
    identity,
    processing,
    onClose,
    onConfirm,
    onFixBlanks,
}: ConfirmSubmitModalProps) {
    const blanks = stats.blanks.length;
    const complete = blanks === 0;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Periksa dulu sebelum dikirim"
            description={`${identity.nama_petugas || 'Petugas belum diisi'}, ${formatTanggal(identity.tanggal_pemeriksaan)}, ${weekLabel(identity.week)}, ${lineLabel(identity.line)}.`}
            tone={complete ? 'brand' : 'danger'}
            footer={
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={processing}>
                        {complete ? 'Periksa lagi' : 'Tutup'}
                    </Button>
                    {complete ? (
                        <Button type="button" variant="primary" loading={processing} onClick={onConfirm}>
                            Ya, kirim sekarang
                        </Button>
                    ) : (
                        <Button type="button" variant="danger" onClick={onFixBlanks}>
                            Lihat item yang kosong
                        </Button>
                    )}
                </div>
            }
        >
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-[10px] border border-line bg-canvas px-3 py-2.5">
                    <p className="font-mono text-[20px] font-semibold tabular-nums text-ink">
                        {stats.answered}
                        <span className="text-[13px] font-normal text-ink-soft"> / {stats.total}</span>
                    </p>
                    <p className="text-[12px] text-ink-soft">Item wajib sudah diisi</p>
                </div>
                <div className="rounded-[10px] border border-line bg-canvas px-3 py-2.5">
                    <p className={`font-mono text-[20px] font-semibold tabular-nums ${blanks > 0 ? 'text-bad' : 'text-ok'}`}>
                        {blanks}
                    </p>
                    <p className="text-[12px] text-ink-soft">Masih kosong</p>
                </div>
            </div>

            <dl className="mt-3 divide-y divide-line rounded-[10px] border border-line">
                {SEVERITIES.map((severity) => (
                    <div key={severity} className="flex items-center justify-between gap-3 px-3 py-2">
                        <dt>
                            <Badge tone={severity}>{SEVERITY_LABEL[severity]}</Badge>
                        </dt>
                        <dd className="font-mono text-[14px] tabular-nums text-ink">{stats.counts[severity]} jawaban</dd>
                    </div>
                ))}
            </dl>

            {complete ? (
                <p className="mt-3 text-[13px] leading-snug text-ink-soft">
                    Setelah dikirim, isian ini langsung masuk ke laporan bulanan dan admin menerima pemberitahuan.
                </p>
            ) : (
                <p className="mt-3 rounded-[4px] bg-bad-soft px-3 py-2 text-[13px] leading-snug text-ink">
                    Masih ada <span className="font-mono tabular-nums">{blanks}</span> item wajib yang kosong, jadi
                    checklist ini akan ditolak server. Kembali ke form untuk melengkapinya dulu.
                </p>
            )}
        </Modal>
    );
}
