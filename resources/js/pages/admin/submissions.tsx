import { Head } from '@inertiajs/react';

import { Pagination } from '@/components/admin/pagination';
import { SeverityLegend } from '@/components/admin/severity';
import {
    SubmissionFilters,
    type SubmissionFilterState,
} from '@/components/admin/submission-filters';
import { SubmissionsTable } from '@/components/admin/submissions-table';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import AppLayout from '@/layouts/app-layout';
import type { Paginated, SubmissionSummary } from '@/types';

interface Props {
    submissions: Paginated<SubmissionSummary>;
    filters: SubmissionFilterState;
}

export default function AdminSubmissions({ submissions, filters }: Props) {
    const filtered = Boolean(filters.week || filters.line || filters.month || filters.q);

    return (
        <AppLayout title="Data checklist" size="wide">
            <Head title="Data checklist" />

            <Section pad="sm">
                <Container size="wide" className="space-y-4">
                    <Card>
                        <CardHeader
                            title="Semua checklist masuk"
                            description="Satu baris sama dengan satu pengisian untuk kombinasi minggu dan line."
                        />

                        <SubmissionFilters filters={filters} />

                        <SubmissionsTable rows={submissions.data} filtered={filtered} />

                        <CardBody className="space-y-4">
                            <SeverityLegend />

                            <Pagination
                                links={submissions.links}
                                currentPage={submissions.current_page}
                                lastPage={submissions.last_page}
                                total={submissions.total}
                            />
                        </CardBody>
                    </Card>
                </Container>
            </Section>
        </AppLayout>
    );
}
