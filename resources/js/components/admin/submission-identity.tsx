import { Card, CardBody, CardHeader } from '@/components/ui/card';
import type { SubmissionDetail } from '@/types';

import { SeverityChips, SeverityLegend } from './severity';

function Fact({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0">
            <dt className="font-display text-[11px] font-semibold tracking-wide text-ink-soft uppercase">
                {label}
            </dt>
            <dd className="mt-0.5 truncate text-sm text-ink" title={value}>
                {value}
            </dd>
        </div>
    );
}

export function SubmissionIdentity({ submission }: { submission: SubmissionDetail }) {
    return (
        <Card>
            <CardHeader
                title={submission.nama_petugas}
                description={`LINE ${submission.line}, minggu ${submission.week}, periode ${submission.period_label}`}
                action={<SeverityChips counts={submission.counts} />}
            />

            <CardBody className="space-y-4">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5 sm:grid-cols-3 lg:grid-cols-5">
                    <Fact label="Tanggal periksa" value={submission.tanggal_pemeriksaan} />
                    <Fact label="Minggu" value={`Minggu ${submission.week}`} />
                    <Fact label="Line" value={`LINE ${submission.line}`} />
                    <Fact label="Diisi oleh" value={submission.author ?? 'Tidak diketahui'} />
                    <Fact label="Disimpan" value={submission.created_at} />
                </dl>

                <SeverityLegend className="border-t border-line pt-3" />
            </CardBody>
        </Card>
    );
}
