import { cn } from '@/lib/cn';

/**
 * The mark is the sheet itself: three checklist rows, two answered, one still open.
 * Same geometry as the PWA icons in public/icons, drawn inline so it stays crisp
 * at 24px in the sidebar and at 40px on the login panel.
 */
export function BrandMark({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                'inline-flex size-9 items-center justify-center rounded-[6px] bg-brand text-white',
                className,
            )}
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className="size-[62%]"
                stroke="currentColor"
                strokeLinecap="square"
            >
                <path d="M2.6 6.2h6.6" strokeWidth="2" />
                <path d="M2.6 12.8h6.6" strokeWidth="2" />
                <path d="M2.6 19.4h6.6" strokeWidth="2" opacity="0.45" />
                <path d="M13.2 19.4H21" strokeWidth="2" opacity="0.45" />
                <path d="m13.2 6.4 2.4 2.4L21 3.4" strokeWidth="2.2" />
                <path d="m13.2 13 2.4 2.4L21 10" strokeWidth="2.2" />
            </svg>
        </span>
    );
}
