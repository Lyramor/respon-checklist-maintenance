import { Head } from '@inertiajs/react';

import { NotificationPanel } from '@/components/admin/notification-panel';
import { Pagination } from '@/components/admin/pagination';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import AppLayout from '@/layouts/app-layout';
import type { NotificationItem, Paginated } from '@/types';

interface Props {
    feed: Paginated<NotificationItem>;
}

export default function AdminNotifications({ feed }: Props) {
    const unread = feed.data.filter((item) => !item.read).length;

    return (
        <AppLayout title="Notifikasi">
            <Head title="Notifikasi" />

            <Section pad="sm">
                <Container>
                    <NotificationPanel
                        items={feed.data}
                        unread={unread}
                        pagination={
                            <Pagination
                                links={feed.links}
                                currentPage={feed.current_page}
                                lastPage={feed.last_page}
                                total={feed.total}
                            />
                        }
                    />
                </Container>
            </Section>
        </AppLayout>
    );
}
