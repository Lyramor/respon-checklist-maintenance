import { Head } from '@inertiajs/react';

import { CoverageGrid, type CoverageSlot } from '@/components/admin/coverage-grid';
import { DashboardActions } from '@/components/admin/dashboard-actions';
import { RecentSubmissions } from '@/components/admin/recent-submissions';
import { StatTiles, type AdminStats } from '@/components/admin/stat-tiles';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import AppLayout from '@/layouts/app-layout';
import type { SubmissionSummary } from '@/types';

interface Props {
    stats: AdminStats;
    coverage: CoverageSlot[];
    period: { year: number; month: number; label: string };
    recent: SubmissionSummary[];
}

export default function AdminDashboard({ stats, coverage, period, recent }: Props) {
    return (
        <AppLayout title="Dashboard admin" size="wide">
            <Head title="Dashboard admin" />

            <Section pad="sm">
                <Container size="wide" className="space-y-5">
                    <DashboardActions periodLabel={period.label} />

                    <CoverageGrid coverage={coverage} periodLabel={period.label} />

                    <StatTiles stats={stats} periodLabel={period.label} />

                    <RecentSubmissions recent={recent} />
                </Container>
            </Section>
        </AppLayout>
    );
}
