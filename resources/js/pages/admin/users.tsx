import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

import { Pagination } from '@/components/admin/pagination';
import { UserCreatePanel } from '@/components/admin/user-create-panel';
import { UserDeleteModal } from '@/components/admin/user-delete-modal';
import { UsersTable } from '@/components/admin/users-table';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import AppLayout from '@/layouts/app-layout';
import type { ManagedUser, Paginated, SharedProps } from '@/types';

interface Props {
    users: Paginated<ManagedUser>;
}

export default function AdminUsers({ users }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const [target, setTarget] = useState<ManagedUser | null>(null);

    return (
        <AppLayout title="Kelola akun" size="wide">
            <Head title="Kelola akun" />

            <Section pad="sm">
                <Container size="wide" className="space-y-4">
                    <UserCreatePanel />

                    <Card>
                        <CardHeader
                            title="Daftar akun"
                            description="Kolom checklist menghitung berapa kali akun tersebut mengisi form."
                        />

                        <UsersTable
                            users={users.data}
                            currentUserId={auth.user?.id ?? null}
                            onDelete={setTarget}
                        />

                        <CardBody>
                            <Pagination
                                links={users.links}
                                currentPage={users.current_page}
                                lastPage={users.last_page}
                                total={users.total}
                            />
                        </CardBody>
                    </Card>
                </Container>
            </Section>

            <UserDeleteModal target={target} onClose={() => setTarget(null)} />
        </AppLayout>
    );
}
