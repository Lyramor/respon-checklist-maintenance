import { cn } from '@/lib/cn';

export function Credit({
    className,
    tone = 'light',
}: {
    className?: string;
    tone?: 'light' | 'dark';
}) {
    const isDark = tone === 'dark';

    return (
        <p
            className={cn(
                'text-[12px] leading-relaxed',
                isDark ? 'text-white/60' : 'text-ink-soft',
                className,
            )}
        >
            Dibuat oleh{' '}
            <a
                href="https://krevostudio.com"
                target="_blank"
                rel="noreferrer"
                className={cn(
                    'font-medium underline underline-offset-2 transition-colors',
                    isDark ? 'text-white/85 hover:text-white' : 'text-brand hover:text-brand-ink',
                )}
            >
                krevostudio.com
            </a>
        </p>
    );
}
