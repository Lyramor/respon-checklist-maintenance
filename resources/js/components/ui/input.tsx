import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    invalid?: boolean;
}

export const controlBase =
    'h-10 w-full rounded-[4px] border bg-surface px-3 text-sm text-ink transition-colors ' +
    'placeholder:text-ink-soft/70 focus:outline-none focus:ring-2 ' +
    'disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-soft';

export const controlIdle = 'border-line focus:border-brand focus:ring-brand/15';

export const controlInvalid = 'border-bad bg-bad-soft/40 ring-2 ring-bad/20 focus:border-bad focus:ring-bad/20';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { invalid = false, className, ...rest },
    ref,
) {
    return (
        <input
            ref={ref}
            aria-invalid={invalid || undefined}
            className={cn(controlBase, invalid ? controlInvalid : controlIdle, className)}
            {...rest}
        />
    );
});
