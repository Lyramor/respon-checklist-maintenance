import { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/cn';
import { routes } from '@/routes';
import type { NotificationItem, SharedProps } from '@/types';

const POLL_MS = 30_000;

/** The shared prop can be missing or shadowed. Never let that take the topbar down. */
function readFeed(raw: unknown): { unread: number; items: NotificationItem[] } {
    const bag = raw as { unread?: unknown; items?: unknown } | null | undefined;

    return {
        unread: typeof bag?.unread === 'number' && Number.isFinite(bag.unread) ? bag.unread : 0,
        items: Array.isArray(bag?.items) ? (bag.items as NotificationItem[]) : [],
    };
}

export function NotificationBell() {
    const page = usePage<SharedProps>();
    const { unread, items } = readFeed(page.props.notifications);
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const id = window.setInterval(() => {
            router.reload({ only: ['notifications'] });
        }, POLL_MS);

        return () => window.clearInterval(id);
    }, []);

    useEffect(() => {
        if (!open) {
            return;
        }

        const onPointerDown = (event: MouseEvent) => {
            if (!wrapperRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    const markRead = () => {
        router.post(
            routes.admin.notificationsRead(),
            {},
            { preserveScroll: true, preserveState: true, only: ['notifications'] },
        );
    };

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-haspopup="dialog"
                aria-label={
                    unread > 0 ? `Notifikasi, ${unread} belum dibaca` : 'Notifikasi, semua sudah dibaca'
                }
                className={cn(
                    'relative flex size-9 items-center justify-center rounded-[4px] border',
                    'transition-colors',
                    open
                        ? 'border-brand bg-brand-soft text-brand'
                        : 'border-line bg-surface text-ink-soft hover:border-brand hover:text-brand',
                )}
            >
                <Bell aria-hidden className="size-4.5" />
                {unread > 0 ? (
                    <span
                        data-numeric
                        className={cn(
                            'absolute -top-1.5 -right-1.5 min-w-5 rounded-full bg-bad px-1',
                            'text-center text-[10px] leading-5 font-semibold text-white',
                        )}
                    >
                        {unread > 99 ? '99+' : unread}
                    </span>
                ) : null}
            </button>

            {open ? (
                <div
                    role="dialog"
                    aria-label="Daftar notifikasi"
                    className={cn(
                        'absolute right-0 z-40 mt-2 w-[min(340px,calc(100vw-32px))]',
                        'rounded-[10px] border border-line bg-surface shadow-panel',
                    )}
                >
                    <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                        <p className="font-display text-[13px] font-semibold text-ink">Notifikasi</p>
                        {unread > 0 ? (
                            <button
                                type="button"
                                onClick={markRead}
                                className="text-[12px] font-medium text-brand underline underline-offset-2 hover:text-brand-ink"
                            >
                                Tandai sudah dibaca
                            </button>
                        ) : null}
                    </div>

                    <ul className="scroll-panel max-h-[320px] divide-y divide-line overflow-y-auto">
                        {items.length === 0 ? (
                            <li className="px-4 py-6">
                                <p className="text-[13px] font-medium text-ink">Belum ada kabar baru.</p>
                                <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                                    Isian checklist yang masuk akan muncul di sini otomatis.
                                </p>
                            </li>
                        ) : (
                            items.slice(0, 8).map((item) => (
                                <li key={item.id} className={cn(!item.read && 'bg-brand-soft/35')}>
                                    <Link
                                        href={item.url ?? routes.admin.notifications()}
                                        onClick={() => setOpen(false)}
                                        className="block px-4 py-3 transition-colors hover:bg-canvas"
                                    >
                                        <p className="text-[13px] leading-snug font-medium text-ink">
                                            {item.title}
                                        </p>
                                        <p className="mt-0.5 text-[12px] leading-snug text-ink-soft">
                                            {item.message}
                                        </p>
                                        <p data-numeric className="mt-1 text-[11px] text-ink-soft/80">
                                            {item.created_at}
                                        </p>
                                    </Link>
                                </li>
                            ))
                        )}
                    </ul>

                    <div className="border-t border-line px-4 py-2.5">
                        <Link
                            href={routes.admin.notifications()}
                            onClick={() => setOpen(false)}
                            className="text-[12px] font-medium text-brand hover:text-brand-ink"
                        >
                            Buka semua notifikasi
                        </Link>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
