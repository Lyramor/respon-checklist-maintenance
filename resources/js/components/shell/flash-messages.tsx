import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CircleCheck, TriangleAlert, X } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';

interface FlashMessagesProps {
    className?: string;
    /** When set, the banner brings its own gutters so a layout can drop it in without a wrapper. */
    size?: 'narrow' | 'default' | 'wide' | 'full';
}

export function FlashMessages({ className, size }: FlashMessagesProps) {
    const page = usePage<SharedProps>();
    const success = page.props.flash?.success ?? null;
    const error = page.props.flash?.error ?? null;
    const [hidden, setHidden] = useState<string | null>(null);

    useEffect(() => {
        setHidden(null);
    }, [success, error]);

    const message = error ?? success;
    const isError = Boolean(error);

    if (!message || hidden === message) {
        return null;
    }

    const Icon = isError ? TriangleAlert : CircleCheck;

    const banner = (
        <div
            role="status"
            className={cn(
                'flex items-start gap-2.5 rounded-[10px] border px-4 py-3',
                isError ? 'border-bad/30 bg-bad-soft' : 'border-ok/30 bg-ok-soft',
                className,
            )}
        >
            <Icon
                aria-hidden
                className={cn('mt-0.5 size-4 shrink-0', isError ? 'text-bad' : 'text-ok')}
            />
            <p
                className={cn(
                    'flex-1 text-[13px] leading-relaxed font-medium',
                    isError ? 'text-bad' : 'text-ok',
                )}
            >
                {message}
            </p>
            <button
                type="button"
                onClick={() => setHidden(message)}
                aria-label="Tutup pesan"
                className={cn(
                    'rounded-[4px] p-1 transition-opacity hover:opacity-70',
                    isError ? 'text-bad' : 'text-ok',
                )}
            >
                <X aria-hidden className="size-3.5" />
            </button>
        </div>
    );

    if (!size) {
        return banner;
    }

    return (
        <Container size={size} className="pt-[clamp(16px,3vh,28px)]">
            {banner}
        </Container>
    );
}
