import { cn } from '@/lib/cn';

interface ChoiceRowProps {
    /** Id dipasang pada tombol pertama supaya bisa jadi target fokus saat validasi gagal. */
    id: string;
    name: string;
    values: number[];
    value: number;
    columns: 4 | 5;
    invalid?: boolean;
    formatLabel: (value: number) => string;
    onChange: (value: number) => void;
}

/**
 * Pemilih angka berbentuk deret tombol besar. Dipakai untuk Week dan Line karena
 * pilihannya sedikit dan form ini diisi di lapangan sambil memakai sarung tangan.
 */
export function ChoiceRow({ id, name, values, value, columns, invalid, formatLabel, onChange }: ChoiceRowProps) {
    return (
        <div
            role="radiogroup"
            aria-label={name}
            className={cn('grid gap-2', columns === 5 ? 'grid-cols-5' : 'grid-cols-4')}
        >
            {values.map((option, index) => {
                const active = option === value;

                return (
                    <button
                        key={option}
                        id={index === 0 ? id : undefined}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => onChange(option)}
                        className={cn(
                            'flex min-h-[52px] items-center justify-center rounded-[4px] border px-1 font-display text-[15px] font-semibold tabular-nums transition-colors',
                            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                            active
                                ? 'border-brand bg-brand text-surface'
                                : 'border-line bg-surface text-ink hover:border-brand hover:text-brand',
                            !active && invalid ? 'border-bad/60' : null,
                        )}
                    >
                        {formatLabel(option)}
                    </button>
                );
            })}
        </div>
    );
}
