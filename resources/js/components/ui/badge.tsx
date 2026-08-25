import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'brand' | 'ok' | 'warn' | 'bad';

const tones: Record<Tone, string> = {
    neutral: 'border-line bg-canvas text-ink-soft',
    brand: 'border-brand/25 bg-brand-soft text-brand',
    ok: 'border-ok/25 bg-ok-soft text-ok',
    warn: 'border-warn/25 bg-warn-soft text-warn',
    bad: 'border-bad/25 bg-bad-soft text-bad',
};

export function Badge({
    tone = 'neutral',
    className,
    children,
}: {
    tone?: Tone;
    className?: string;
    children: ReactNode;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5',
                'text-[11px] leading-5 font-medium tracking-[0.01em] whitespace-nowrap',
                tones[tone],
                className,
            )}
        >
            {children}
        </span>
    );
}
