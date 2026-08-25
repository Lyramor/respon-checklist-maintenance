import { Head } from '@inertiajs/react';

import { ActivityTimeline } from '@/components/admin/activity-timeline';
import { ActivityToolbar } from '@/components/admin/activity-toolbar';
import { Pagination } from '@/components/admin/pagination';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import AppLayout from '@/layouts/app-layout';
import type { ActivityEntry, Paginated } from '@/types';

interface Props {
    activities: Paginated<ActivityEntry>;
    filters: { q?: string | null };
}

export default function AdminActivity({ activities, filters }: Props) {
    return (
        <AppLayout title="Log aktivitas">
            <Head title="Log aktivitas" />

            <Section pad="sm">
                <Container className="space-y-4">
                    <Card>
                        <CardHeader
                            title="Jejak aktivitas"
                            description="Urut dari yang paling baru, dikelompokkan per hari."
                        />

                        <ActivityToolbar q={filters.q} />

                        <ActivityTimeline
                            entries={activities.data}
                            filtered={Boolean(filters.q)}
                        />

                        <CardBody>
                            <Pagination
                                links={activities.links}
                                currentPage={activities.current_page}
                                lastPage={activities.last_page}
                                total={activities.total}
                            />
                        </CardBody>
                    </Card>
                </Container>
            </Section>
        </AppLayout>
    );
}
