import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import type { SubmissionSummary } from '@/types';

interface SeveritySummaryProps {
    counts: SubmissionSummary['counts'];
    className?: string;
}

/**
 * Ringkasan hasil satu isian: berapa poin aman, perlu dicek, dan temuan.
 * Warna selalu berpasangan dengan teks, jangan pernah warna saja.
 */
export function SeveritySummary({ counts, className }: SeveritySummaryProps) {
    return (
        <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
            <Badge tone="ok">{counts.ok} aman</Badge>
            <Badge tone={counts.warn > 0 ? 'warn' : 'neutral'}>{counts.warn} dicek</Badge>
            <Badge tone={counts.bad > 0 ? 'bad' : 'neutral'}>{counts.bad} temuan</Badge>
        </div>
    );
}
