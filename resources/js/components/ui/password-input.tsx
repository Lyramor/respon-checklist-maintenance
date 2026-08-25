import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/cn';
import { controlBase, controlIdle, controlInvalid } from './input';

export interface PasswordInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    invalid?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    function PasswordInput({ invalid = false, className, ...rest }, ref) {
        const [visible, setVisible] = useState(false);
        const Icon = visible ? EyeOff : Eye;
        const label = visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi';

        return (
            <div className="relative">
                <input
                    ref={ref}
                    type={visible ? 'text' : 'password'}
                    aria-invalid={invalid || undefined}
                    className={cn(
                        controlBase,
                        invalid ? controlInvalid : controlIdle,
                        'pr-11',
                        className,
                    )}
                    {...rest}
                />
                <button
                    type="button"
                    onClick={() => setVisible((current) => !current)}
                    aria-label={label}
                    aria-pressed={visible}
                    title={label}
                    className={cn(
                        'absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-[4px]',
                        'text-ink-soft transition-colors hover:text-brand',
                    )}
                >
                    <Icon aria-hidden className="size-4.5" />
                </button>
            </div>
        );
    },
);
