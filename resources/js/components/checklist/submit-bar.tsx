import { Button } from '@/components/ui/button';

interface SubmitBarProps {
    blankCount: number;
    processing: boolean;
    onOpenConfirm: () => void;
}

export function SubmitBar({ blankCount, processing, onOpenConfirm }: SubmitBarProps) {
    return (
        <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 text-[13px] leading-snug text-ink-soft">
                {blankCount > 0 ? (
                    <>
                        <span className="font-mono tabular-nums text-bad">{blankCount}</span> item wajib belum diisi
                    </>
                ) : (
                    <span className="text-ok">Semua item wajib sudah terisi</span>
                )}
            </p>

            <Button type="button" variant="primary" size="md" loading={processing} onClick={onOpenConfirm}>
                Kirim Checklist
            </Button>
        </div>
    );
}
