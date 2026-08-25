import { Link, usePage } from '@inertiajs/react';
import { LogOut, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { routes } from '@/routes';
import type { SharedProps } from '@/types';
import { BrandMark } from './brand-mark';
import { isActive, navFor } from './nav-items';

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
    const page = usePage<SharedProps>();
    const user = page.props.auth.user;
    const groups = navFor(user?.role);

    return (
        <div className="flex h-full flex-col bg-brand text-white">
            <div className="flex items-center gap-2.5 border-b border-white/10 px-4 py-4">
                <BrandMark className="size-8 bg-white/15" />
                <div className="min-w-0">
                    <p className="font-display text-[15px] leading-tight font-semibold">
                        Checklist HCA
                    </p>
                    <p className="truncate text-[11px] text-white/60">Monitoring Maintenance</p>
                </div>
            </div>

            <nav className="scroll-panel flex-1 overflow-y-auto px-2.5 py-4">
                {groups.map((group) => (
                    <div key={group.label} className="mb-5 last:mb-0">
                        <p className="px-2.5 pb-2 font-display text-[10px] font-semibold tracking-[0.14em] text-white/45 uppercase">
                            {group.label}
                        </p>
                        <ul className="flex flex-col gap-0.5">
                            {group.items.map((item) => {
                                const active = isActive(page.url, item);
                                const Icon = item.icon;

                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={onNavigate}
                                            aria-current={active ? 'page' : undefined}
                                            className={cn(
                                                'flex items-center gap-2.5 rounded-[4px] px-2.5 py-2',
                                                'text-[13px] font-medium transition-colors',
                                                active
                                                    ? 'bg-white/15 text-white'
                                                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                                            )}
                                        >
                                            <Icon aria-hidden className="size-4 shrink-0" />
                                            <span className="truncate">{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {user ? (
                <div className="border-t border-white/10 px-4 py-3.5">
                    <p className="truncate font-display text-[13px] font-semibold">{user.name}</p>
                    <p className="truncate text-[11px] text-white/55">
                        <span data-numeric>{user.username}</span>
                        <span aria-hidden> / </span>
                        {user.role === 'admin' ? 'Admin' : 'Responden'}
                    </p>
                    <Link
                        href={routes.logout()}
                        method="post"
                        as="button"
                        className={cn(
                            'mt-3 flex w-full items-center justify-center gap-2 rounded-[4px]',
                            'border border-white/20 px-3 py-1.5 text-[12px] font-medium text-white/80',
                            'transition-colors hover:border-white/40 hover:text-white',
                        )}
                    >
                        <LogOut aria-hidden className="size-3.5" />
                        Keluar
                    </Link>
                </div>
            ) : null}
        </div>
    );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
    return (
        <>
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-sidebar lg:block">
                <SidebarContent />
            </aside>

            <div
                className={cn('fixed inset-0 z-40 lg:hidden', open ? 'visible' : 'invisible')}
                aria-hidden={!open}
            >
                <div
                    onClick={onClose}
                    className={cn(
                        'absolute inset-0 bg-ink/50 transition-opacity duration-200',
                        open ? 'opacity-100' : 'opacity-0',
                    )}
                />
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menu navigasi"
                    className={cn(
                        'absolute inset-y-0 left-0 w-[264px] max-w-[82vw] shadow-panel',
                        'transition-transform duration-200 ease-out',
                        open ? 'translate-x-0' : '-translate-x-full',
                    )}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup menu"
                        className={cn(
                            'absolute top-3.5 right-3 z-10 rounded-[4px] p-1.5 text-white/70',
                            'hover:bg-white/10 hover:text-white',
                        )}
                    >
                        <X aria-hidden className="size-4" />
                    </button>
                    <SidebarContent onNavigate={onClose} />
                </div>
            </div>
        </>
    );
}
