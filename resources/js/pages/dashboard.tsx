import { Head, usePage } from '@inertiajs/react';

import { AdminView, type AdminStats } from '@/components/dashboard/admin-view';
import { DashboardHeading } from '@/components/dashboard/dashboard-heading';
import { RespondenView, type RespondenStats } from '@/components/dashboard/responden-view';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import AppLayout from '@/layouts/app-layout';
import type { Role, SharedProps } from '@/types';

interface DashboardProps {
    role: Role;
    mine: RespondenStats;
    admin?: AdminStats;
}

export default function Dashboard({ role, mine, admin }: DashboardProps) {
    const { auth } = usePage<SharedProps>().props;
    const activeRole: Role = auth.user?.role ?? role;
    const isAdmin = activeRole === 'admin' && Boolean(admin);

    return (
        <AppLayout title="Dashboard" size={isAdmin ? 'wide' : 'default'}>
            <Head title="Dashboard" />

            <Section pad="sm">
                <Container size={isAdmin ? 'wide' : 'default'} className="space-y-6">
                    <DashboardHeading
                        name={auth.user?.name ?? ''}
                        role={activeRole}
                        periodLabel={isAdmin ? admin?.period.label : undefined}
                    />

                    {isAdmin && admin ? <AdminView admin={admin} /> : <RespondenView mine={mine} />}
                </Container>
            </Section>
        </AppLayout>
    );
}
