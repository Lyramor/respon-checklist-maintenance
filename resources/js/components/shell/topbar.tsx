import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/cn';
import { routes } from '@/routes';
import type { SharedProps } from '@/types';
import { NotificationBell } from './notification-bell';

export function Topbar({ title, onMenu }: { title: string; onMenu: () => void }) {
    const page = usePage<SharedProps>();
    const user = page.props.auth.user;
    const isAdmin = user?.role === 'admin';

    return (
        <header className="sticky top-0 z-20 border-b border-line bg-surface">
            <div className="flex h-14 items-center gap-3 px-[clamp(16px,4vw,40px)]">
                <button
                    type="button"
                    onClick={onMenu}
                    aria-label="Buka menu navigasi"
                    className={cn(
                        'flex size-9 items-center justify-center rounded-[4px] border border-line',
                        'text-ink-soft transition-colors hover:border-brand hover:text-brand lg:hidden',
                    )}
                >
                    <Menu aria-hidden className="size-4.5" />
                </button>

                <h1 className="min-w-0 flex-1 truncate font-display text-[16px] font-semibold text-ink">
                    {title}
                </h1>

                <div className="flex items-center gap-2">
                    {isAdmin ? <NotificationBell /> : null}
                    <Link
                        href={routes.checklist.create()}
                        className={cn(
                            'hidden h-9 items-center rounded-[4px] bg-brand px-3.5 text-[13px]',
                            'font-display font-medium text-white transition-colors hover:bg-brand-ink sm:inline-flex',
                        )}
                    >
                        Isi checklist
                    </Link>
                </div>
            </div>
        </header>
    );
}
