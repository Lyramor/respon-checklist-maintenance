import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { controlIdle, controlInvalid } from './input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    { invalid = false, className, rows = 3, ...rest },
    ref,
) {
    return (
        <textarea
            ref={ref}
            rows={rows}
            aria-invalid={invalid || undefined}
            className={cn(
                'w-full rounded-[4px] border bg-surface px-3 py-2 text-sm leading-relaxed text-ink',
                'transition-colors placeholder:text-ink-soft/70 focus:outline-none focus:ring-2',
                'disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-soft',
                invalid ? controlInvalid : controlIdle,
                className,
            )}
            {...rest}
        />
    );
});
