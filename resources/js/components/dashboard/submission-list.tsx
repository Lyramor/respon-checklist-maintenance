import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { SeveritySummary } from '@/components/dashboard/severity-summary';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/cn';
import type { SubmissionSummary } from '@/types';

const dayFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const shortFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
});

function parse(value: string): Date | null {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatTanggal(value: string): string {
    const parsed = parse(value);
    return parsed ? dayFormatter.format(parsed) : value;
}

export function formatTanggalPendek(value: string): string {
    const parsed = parse(value);
    return parsed ? shortFormatter.format(parsed) : value;
}

interface SubmissionListProps {
    items: SubmissionSummary[];
    showAuthor?: boolean;
    hrefFor?: (item: SubmissionSummary) => string;
    emptyTitle: string;
    emptyDescription: string;
    emptyAction?: ReactNode;
    className?: string;
}

function Row({ item, showAuthor }: { item: SubmissionSummary; showAuthor: boolean }) {
    return (
        <>
            <span className="w-[86px] shrink-0 rounded-[4px] border border-line bg-canvas px-2 py-1 text-center font-mono text-[11px] font-medium text-brand">
                M{item.week} / L{item.line}
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{formatTanggal(item.tanggal_pemeriksaan)}</span>
                <span className="block truncate text-xs text-ink-soft">
                    {showAuthor ? `${item.author ?? item.nama_petugas} · ` : ''}
                    {item.period_label}
                </span>
            </span>
            <SeveritySummary counts={item.counts} className="w-full sm:w-auto sm:justify-end" />
        </>
    );
}

export function SubmissionList({
    items,
    showAuthor = false,
    hrefFor,
    emptyTitle,
    emptyDescription,
    emptyAction,
    className,
}: SubmissionListProps) {
    if (items.length === 0) {
        return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
    }

    return (
        <ul className={cn('divide-y divide-line', className)}>
            {items.map((item) => (
                <li key={item.id}>
                    {hrefFor ? (
                        <Link
                            href={hrefFor(item)}
                            className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3 transition-colors hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-none"
                        >
                            <Row item={item} showAuthor={showAuthor} />
                        </Link>
                    ) : (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                            <Row item={item} showAuthor={showAuthor} />
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
}
