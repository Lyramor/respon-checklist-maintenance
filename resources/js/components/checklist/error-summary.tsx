import { Button } from '@/components/ui/button';

interface ErrorSummaryProps {
    blankCount: number;
    total: number;
    identityIssues: string[];
    onJump: () => void;
}

/**
 * Banner ringkasan di atas form. Bukan dialog, supaya petugas tetap bisa
 * menggulir form sambil membaca apa yang kurang.
 */
export function ErrorSummary({ blankCount, total, identityIssues, onJump }: ErrorSummaryProps) {
    if (blankCount === 0 && identityIssues.length === 0) {
        return null;
    }

    return (
        <div
            id="ringkasan-error"
            role="alert"
            className="scroll-mt-24 rounded-[10px] border border-bad/40 bg-bad-soft px-4 py-4 sm:px-5"
        >
            <p className="font-display text-[16px] font-semibold text-bad">Checklist belum bisa dikirim</p>

            <ul className="mt-2 space-y-1 text-[14px] leading-snug text-ink">
                {blankCount > 0 ? (
                    <li>
                        <span className="font-mono tabular-nums">{blankCount}</span> dari {total} item wajib masih kosong.
                    </li>
                ) : null}
                {identityIssues.map((issue) => (
                    <li key={issue}>{issue}</li>
                ))}
            </ul>

            <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={onJump}>
                Lompat ke isian pertama yang kosong
            </Button>
        </div>
    );
}
