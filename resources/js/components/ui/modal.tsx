import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children?: ReactNode;
    footer?: ReactNode;
    tone?: 'brand' | 'danger';
}

const FOCUSABLE =
    'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

export function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    tone = 'brand',
}: ModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const titleId = useId();

    useEffect(() => {
        if (!open) {
            return;
        }

        const { body } = document;
        const previousOverflow = body.style.overflow;
        const previouslyFocused = document.activeElement as HTMLElement | null;
        body.style.overflow = 'hidden';

        const panel = panelRef.current;
        panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();

                return;
            }

            if (event.key !== 'Tab' || !panel) {
                return;
            }

            const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));

            if (items.length === 0) {
                return;
            }

            const first = items[0];
            const last = items[items.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && (active === first || !panel.contains(active))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            body.style.overflow = previousOverflow;
            previouslyFocused?.focus?.();
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            <div
                className="absolute inset-0 bg-ink/50"
                onClick={onClose}
                aria-hidden
            />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className={cn(
                    'relative w-full max-w-[480px] rounded-t-[10px] border border-line bg-surface',
                    'shadow-panel sm:rounded-[10px]',
                )}
            >
                <span
                    aria-hidden
                    className={cn(
                        'absolute inset-x-0 top-0 h-1 rounded-t-[10px]',
                        tone === 'danger' ? 'bg-bad' : 'bg-brand',
                    )}
                />
                <div className="flex items-start justify-between gap-4 px-5 pt-5">
                    <div>
                        <h2
                            id={titleId}
                            className="font-display text-[17px] leading-tight font-semibold text-ink"
                        >
                            {title}
                        </h2>
                        {description ? (
                            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                                {description}
                            </p>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup dialog"
                        className="-mt-1 -mr-1 rounded-[4px] p-1.5 text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
                    >
                        <X aria-hidden className="size-4" />
                    </button>
                </div>

                {children ? <div className="px-5 pt-4 text-sm text-ink">{children}</div> : null}

                {footer ? (
                    <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3.5">
                        {footer}
                    </div>
                ) : (
                    <div className="h-5" />
                )}
            </div>
        </div>
    );
}
