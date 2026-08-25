import { Link } from '@inertiajs/react';

import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { routes } from '@/routes';
import type { SubmissionSummary } from '@/types';

import { SeverityChips } from './severity';

export function RecentSubmissions({ recent }: { recent: SubmissionSummary[] }) {
    return (
        <Card>
            <CardHeader
                title="Checklist terbaru"
                description="Sepuluh pengisian paling akhir dari semua line."
                action={
                    <Link
                        href={routes.admin.submissions()}
                        className="rounded-[4px] px-2 py-1 text-xs font-medium text-brand hover:bg-brand-soft"
                    >
                        Lihat semua
                    </Link>
                }
            />

            <CardBody className="p-0">
                {recent.length === 0 ? (
                    <div className="p-4">
                        <EmptyState
                            title="Belum ada checklist masuk"
                            description="Begitu petugas mengisi form, hasilnya muncul di sini beserta ringkasan temuannya."
                        />
                    </div>
                ) : (
                    <ul className="divide-y divide-line">
                        {recent.map((item) => (
                            <li key={item.id}>
                                <Link
                                    href={routes.admin.submission(item.id)}
                                    className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-canvas"
                                >
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-medium text-ink">
                                            {item.nama_petugas}
                                        </span>
                                        <span className="mt-0.5 block font-mono text-[11px] text-ink-soft">
                                            LINE {item.line} / Minggu {item.week} /{' '}
                                            {item.tanggal_pemeriksaan}
                                        </span>
                                    </span>

                                    <SeverityChips counts={item.counts} className="shrink-0" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </CardBody>
        </Card>
    );
}
