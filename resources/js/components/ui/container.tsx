import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ContainerSize = 'narrow' | 'default' | 'wide' | 'full';

interface ContainerProps {
    size?: ContainerSize;
    className?: string;
    children: ReactNode;
}

const widths: Record<ContainerSize, string> = {
    narrow: 'max-w-[720px]',
    default: 'max-w-[1280px]',
    wide: 'max-w-[1440px]',
    full: 'max-w-full',
};

/** The only place horizontal gutters and max width are defined. */
export function Container({ size = 'default', className, children }: ContainerProps) {
    return (
        <div className={cn('mx-auto w-full px-[clamp(16px,4vw,40px)]', widths[size], className)}>
            {children}
        </div>
    );
}
