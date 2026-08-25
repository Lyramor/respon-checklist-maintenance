import { cn } from '@/lib/cn';

export interface AdminStats {
    submissions_total: number;
    submissions_month: number;
    users_total: number;
    responden_total: number;
}

interface Tile {
    label: string;
    value: number;
    caption: string;
    accent?: boolean;
}

export function StatTiles({ stats, periodLabel }: { stats: AdminStats; periodLabel: string }) {
    const tiles: Tile[] = [
        {
            label: 'Checklist bulan ini',
            value: stats.submissions_month,
            caption: periodLabel,
            accent: true,
        },
        {
            label: 'Total checklist',
            value: stats.submissions_total,
            caption: 'Sejak awal pemakaian',
        },
        {
            label: 'Akun terdaftar',
            value: stats.users_total,
            caption: 'Admin dan responden',
        },
        {
            label: 'Akun responden',
            value: stats.responden_total,
            caption: 'Hanya bisa mengisi form',
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tiles.map((tile) => (
                <div
                    key={tile.label}
                    className={cn(
                        'rounded-[10px] border px-4 py-3.5',
                        tile.accent
                            ? 'border-brand/25 bg-brand-soft'
                            : 'border-line bg-surface',
                    )}
                >
                    <p className="font-display text-[11px] font-semibold tracking-wide text-ink-soft uppercase">
                        {tile.label}
                    </p>
                    <p
                        className={cn(
                            'mt-1 font-mono text-[clamp(24px,4vw,32px)] leading-none font-semibold',
                            tile.accent ? 'text-brand' : 'text-ink',
                        )}
                    >
                        {tile.value}
                    </p>
                    <p className="mt-1.5 text-xs text-ink-soft">{tile.caption}</p>
                </div>
            ))}
        </div>
    );
}
