import { Link, router } from '@inertiajs/react';
import { CheckCheck } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/cn';
import { routes } from '@/routes';
import type { NotificationItem } from '@/types';

function MarkAllButton({ disabled }: { disabled: boolean }) {
    const [processing, setProcessing] = useState<boolean>(false);

    const markAll = (): void => {
        router.post(
            routes.admin.notificationsRead(),
            {},
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={markAll}
            loading={processing}
            disabled={disabled || processing}
        >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Tandai semua sudah dibaca
        </Button>
    );
}

function Row({ item }: { item: NotificationItem }) {
    const body: ReactNode = (
        <span className="flex items-start gap-2">
            <span
                aria-hidden="true"
                className={cn(
                    'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                    item.read ? 'bg-line' : 'bg-brand',
                )}
            />
            <span className="min-w-0">
                <span
                    className={cn(
                        'block text-sm',
                        item.read ? 'font-medium text-ink-soft' : 'font-semibold text-ink',
                    )}
                >
                    {item.title}
                </span>
                <span className="mt-0.5 block text-sm leading-relaxed text-ink-soft">
                    {item.message}
                </span>
                <span className="mt-1 block font-mono text-[11px] text-ink-soft/80">
                    {item.created_at}
                    {item.read ? '' : ' / belum dibaca'}
                </span>
            </span>
        </span>
    );

    const className = cn(
        'block px-4 py-3 transition-colors',
        item.read ? 'bg-surface' : 'bg-brand-soft/40',
    );

    if (item.url) {
        return (
            <Link href={item.url} className={cn(className, 'hover:bg-canvas')}>
                {body}
            </Link>
        );
    }

    return <div className={className}>{body}</div>;
}

export function NotificationPanel({
    items,
    unread,
    pagination,
}: {
    items: NotificationItem[];
    unread: number;
    pagination: ReactNode;
}) {
    return (
        <Card>
            <CardHeader
                title="Notifikasi"
                description={
                    unread > 0
                        ? `${unread} notifikasi di halaman ini belum dibaca.`
                        : 'Semua notifikasi di halaman ini sudah dibaca.'
                }
                action={<MarkAllButton disabled={unread === 0} />}
            />

            {items.length === 0 ? (
                <div className="p-4">
                    <EmptyState
                        title="Belum ada notifikasi"
                        description="Setiap kali ada checklist baru masuk atau perubahan akun, pemberitahuannya muncul di sini."
                    />
                </div>
            ) : (
                <ul className="divide-y divide-line border-t border-line">
                    {items.map((item) => (
                        <li key={item.id}>
                            <Row item={item} />
                        </li>
                    ))}
                </ul>
            )}

            <CardBody>{pagination}</CardBody>
        </Card>
    );
}
