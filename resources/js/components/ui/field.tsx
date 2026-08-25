import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface FieldProps {
    label: string;
    htmlFor?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    className?: string;
    children: ReactNode;
}

/** Owns the label, the hint and the red state copy for every control. */
export function Field({
    label,
    htmlFor,
    error,
    hint,
    required = false,
    className,
    children,
}: FieldProps) {
    const invalid = Boolean(error);

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <label
                htmlFor={htmlFor}
                className="flex items-center gap-1.5 text-[13px] leading-snug font-medium text-ink"
            >
                {invalid ? (
                    <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-bad" />
                ) : null}
                <span>{label}</span>
                {required ? (
                    <span className="text-bad" aria-hidden>
                        *
                    </span>
                ) : null}
            </label>

            {children}

            {invalid ? (
                <p className="text-[12px] leading-snug text-bad">{error}</p>
            ) : hint ? (
                <p className="text-[12px] leading-snug text-ink-soft">{hint}</p>
            ) : null}
        </div>
    );
}
