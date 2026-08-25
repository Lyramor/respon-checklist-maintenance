import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
}

const variants: Record<Variant, string> = {
    primary: 'bg-brand text-white hover:bg-brand-ink active:bg-brand-ink',
    secondary:
        'border border-line bg-surface text-ink hover:border-brand hover:text-brand active:bg-brand-soft/50',
    ghost: 'text-ink-soft hover:bg-brand-soft/60 hover:text-brand-ink',
    danger: 'bg-bad text-white hover:bg-bad/90 active:bg-bad',
};

const sizes: Record<Size, string> = {
    sm: 'h-8 gap-1.5 px-3 text-[13px]',
    md: 'h-10 gap-2 px-4 text-sm',
};

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    className,
    children,
    type = 'button',
    ...rest
}: ButtonProps) {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-[4px] font-display font-medium',
                'transition-colors duration-150 select-none',
                'disabled:pointer-events-none disabled:opacity-55',
                sizes[size],
                variants[variant],
                className,
            )}
            {...rest}
        >
            {loading ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
            {children}
        </button>
    );
}
