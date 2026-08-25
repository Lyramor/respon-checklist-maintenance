import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type SectionPad = 'none' | 'sm' | 'default' | 'lg';

interface SectionProps {
    pad?: SectionPad;
    id?: string;
    className?: string;
    children: ReactNode;
}

const pads: Record<SectionPad, string> = {
    none: 'py-0',
    sm: 'py-[clamp(24px,4vh,40px)]',
    default: 'py-[clamp(32px,6vh,64px)]',
    lg: 'py-[clamp(48px,9vh,96px)]',
};

/** The only place vertical rhythm is defined. */
export function Section({ pad = 'default', id, className, children }: SectionProps) {
    return (
        <section id={id} className={cn(pads[pad], className)}>
            {children}
        </section>
    );
}
