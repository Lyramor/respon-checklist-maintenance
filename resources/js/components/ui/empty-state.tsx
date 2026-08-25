import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function EmptyState({
    title,
    description,
    action,
    className,
}: {
    title: string;
    description: string;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col items-start gap-2 rounded-[10px] border border-dashed border-line',
                'bg-canvas/60 px-5 py-8 sm:px-6',
                className,
            )}
        >
            <h3 className="font-display text-[15px] font-semibold text-ink">{title}</h3>
            <p className="max-w-[52ch] text-[13px] leading-relaxed text-ink-soft">{description}</p>
            {action ? <div className="mt-2">{action}</div> : null}
        </div>
    );
}
