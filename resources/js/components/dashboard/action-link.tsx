import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type ActionVariant = 'primary' | 'secondary';
type ActionSize = 'sm' | 'md';

interface ActionLinkProps {
    href: string;
    variant?: ActionVariant;
    size?: ActionSize;
    className?: string;
    children: ReactNode;
}

const variants: Record<ActionVariant, string> = {
    primary: 'bg-brand text-white hover:bg-brand-ink active:bg-brand-ink',
    secondary: 'border border-line bg-surface text-ink hover:border-brand hover:text-brand',
};

const sizes: Record<ActionSize, string> = {
    sm: 'h-8 gap-1.5 px-3 text-[13px]',
    md: 'h-10 gap-2 px-4 text-sm',
};

/**
 * Satu-satunya tempat tautan aksi dashboard didefinisikan, supaya tombol
 * navigasi tidak ditulis ulang dengan kelas acak di tiap section.
 */
export function ActionLink({ href, variant = 'primary', size = 'md', className, children }: ActionLinkProps) {
    return (
        <Link
            href={href}
            className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-[4px] font-display font-medium',
                'transition-colors duration-150 select-none',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                variants[variant],
                sizes[size],
                className,
            )}
        >
            {children}
        </Link>
    );
}
