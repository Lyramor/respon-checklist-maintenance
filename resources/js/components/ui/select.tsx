import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { controlIdle, controlInvalid } from './input';
import type { Severity } from '@/types';

export interface SelectOption {
    value: string;
    label?: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    invalid?: boolean;
    placeholder?: string;
    severity?: Severity | null;
    options: SelectOption[];
}

/** Mirrors the conditional formatting of the Excel sheet the team already uses. */
const severityTint: Record<Severity, string> = {
    ok: 'border-ok/40 bg-ok-soft text-ok focus:border-ok focus:ring-ok/20',
    warn: 'border-warn/40 bg-warn-soft text-warn focus:border-warn focus:ring-warn/20',
    bad: 'border-bad/40 bg-bad-soft text-bad focus:border-bad focus:ring-bad/20',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
    { invalid = false, placeholder, severity = null, options, className, ...rest },
    ref,
) {
    const tone = invalid ? controlInvalid : severity ? severityTint[severity] : controlIdle;

    return (
        <div className="relative">
            <select
                ref={ref}
                aria-invalid={invalid || undefined}
                className={cn(
                    'h-10 w-full appearance-none rounded-[4px] border bg-surface pr-9 pl-3',
                    'text-sm font-medium transition-colors focus:outline-none focus:ring-2',
                    'disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-soft',
                    tone,
                    className,
                )}
                {...rest}
            >
                {placeholder ? (
                    <option value="" className="text-ink-soft">
                        {placeholder}
                    </option>
                ) : null}
                {options.map((option) => (
                    <option key={option.value} value={option.value} className="text-ink">
                        {option.label ?? option.value}
                    </option>
                ))}
            </select>
            <ChevronDown
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 opacity-60"
            />
        </div>
    );
});
