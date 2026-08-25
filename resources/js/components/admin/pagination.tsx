import { Link } from '@inertiajs/react';

import { cn } from '@/lib/cn';
import type { Paginated } from '@/types';

type PageLink = Paginated<unknown>['links'][number];

function readableLabel(label: string): string {
    const clean = label.replace(/&laquo;|&raquo;|«|»/g, '').trim();

    if (/previous|sebelumnya/i.test(clean)) {
        return 'Sebelumnya';
    }

    if (/next|berikutnya/i.test(clean)) {
        return 'Berikutnya';
    }

    return clean;
}

export function Pagination({
    links,
    currentPage,
    lastPage,
    total,
    className,
}: {
    links: PageLink[];
    currentPage: number;
    lastPage: number;
    total: number;
    className?: string;
}) {
    if (lastPage <= 1) {
        return (
            <p className={cn('text-xs text-ink-soft', className)}>
                Menampilkan seluruh {total} data.
            </p>
        );
    }

    return (
        <nav
            aria-label="Navigasi halaman"
            className={cn(
                'flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between',
                className,
            )}
        >
            <p className="text-xs text-ink-soft">
                Halaman {currentPage} dari {lastPage}. Total {total} data.
            </p>

            <div className="-mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-1">
                {links.map((link, index) => {
                    const label = readableLabel(link.label);

                    if (label === '...') {
                        return (
                            <span key={index} className="px-2 text-xs text-ink-soft">
                                ...
                            </span>
                        );
                    }

                    const base =
                        'inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-[4px] border px-2.5 text-xs font-medium transition-colors';

                    if (!link.url) {
                        return (
                            <span
                                key={index}
                                className={cn(base, 'border-line bg-canvas text-ink-soft/60')}
                            >
                                {label}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={index}
                            href={link.url}
                            preserveState
                            preserveScroll
                            aria-current={link.active ? 'page' : undefined}
                            className={cn(
                                base,
                                link.active
                                    ? 'border-brand bg-brand text-surface'
                                    : 'border-line bg-surface text-ink hover:border-brand hover:text-brand',
                            )}
                        >
                            {label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
