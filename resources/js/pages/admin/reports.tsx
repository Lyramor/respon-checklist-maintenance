import { Head } from '@inertiajs/react';
import { useState } from 'react';

import { Pagination } from '@/components/admin/pagination';
import { ReportDeleteModal } from '@/components/admin/report-delete-modal';
import { ReportExportPanel } from '@/components/admin/report-export-panel';
import { ReportHistoryTable } from '@/components/admin/report-history-table';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import AppLayout from '@/layouts/app-layout';
import type { Paginated, ReportExport, ReportPeriod } from '@/types';

interface Props {
    periods: ReportPeriod[];
    exports: Paginated<ReportExport>;
    defaults: { year: number; month: number };
    years: number[];
}

export default function AdminReports({ periods, exports, defaults, years }: Props) {
    const [target, setTarget] = useState<ReportExport | null>(null);

    return (
        <AppLayout title="Laporan" size="wide">
            <Head title="Laporan" />

            <Section pad="sm">
                <Container size="wide" className="space-y-4">
                    <ReportExportPanel
                        periods={periods}
                        defaults={defaults}
                        years={years}
                    />

                    <Card>
                        <CardHeader
                            title="Riwayat export"
                            description="Setiap export tersimpan sebagai file terpisah, jadi versi lama tetap bisa diunduh ulang."
                        />

                        <ReportHistoryTable exports={exports.data} onDelete={setTarget} />

                        <CardBody>
                            <Pagination
                                links={exports.links}
                                currentPage={exports.current_page}
                                lastPage={exports.last_page}
                                total={exports.total}
                            />
                        </CardBody>
                    </Card>
                </Container>
            </Section>

            <ReportDeleteModal target={target} onClose={() => setTarget(null)} />
        </AppLayout>
    );
}
