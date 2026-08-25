import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Table({ className, children }: { className?: string; children: ReactNode }) {
    return (
        <div className="scroll-panel w-full overflow-x-auto">
            <table className={cn('w-full min-w-[640px] border-collapse text-left', className)}>
                {children}
            </table>
        </div>
    );
}

export function THead({ children }: { children: ReactNode }) {
    return <thead className="border-b border-line bg-canvas/70">{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
    return <tbody className="divide-y divide-line">{children}</tbody>;
}

export function TR({ className, children }: { className?: string; children: ReactNode }) {
    return <tr className={cn('transition-colors hover:bg-brand-soft/25', className)}>{children}</tr>;
}

export function TH({ className, children }: { className?: string; children: ReactNode }) {
    return (
        <th
            scope="col"
            className={cn(
                'px-4 py-2.5 font-display text-[11px] font-semibold tracking-[0.06em] text-ink-soft uppercase',
                className,
            )}
        >
            {children}
        </th>
    );
}

export function TD({ className, children }: { className?: string; children: ReactNode }) {
    return <td className={cn('px-4 py-3 align-middle text-[13px] text-ink', className)}>{children}</td>;
}
