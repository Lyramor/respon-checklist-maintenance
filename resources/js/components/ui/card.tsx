import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, children }: { className?: string; children: ReactNode }) {
    return (
        <div
            className={cn(
                'rounded-[10px] border border-line bg-surface shadow-panel',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({
    title,
    description,
    action,
    className,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5',
                className,
            )}
        >
            <div className="min-w-0">
                <h2 className="font-display text-[15px] leading-tight font-semibold text-ink">
                    {title}
                </h2>
                {description ? (
                    <p className="mt-1 text-[13px] leading-snug text-ink-soft">{description}</p>
                ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
    return <div className={cn('px-4 py-4 sm:px-5', className)}>{children}</div>;
}
