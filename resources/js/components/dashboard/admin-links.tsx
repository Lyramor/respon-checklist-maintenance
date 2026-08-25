import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

import { routes } from '@/routes';

const destinations = [
    {
        href: routes.admin.dashboard(),
        title: 'Panel admin',
        description: 'Ringkasan penuh, notifikasi masuk dan log aktivitas.',
    },
    {
        href: routes.admin.submissions(),
        title: 'Semua submission',
        description: 'Telusuri isian per minggu, line dan petugas.',
    },
    {
        href: routes.admin.reports(),
        title: 'Laporan bulanan',
        description: 'Susun dan unduh rekap Excel per periode.',
    },
];

/**
 * Jalan pintas ke area admin. Tetap dua kolom di layar kecil.
 */
export function AdminLinks() {
    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {destinations.map((destination) => (
                <Link
                    key={destination.href}
                    href={destination.href}
                    className="group flex flex-col justify-between gap-3 rounded-[10px] border border-line bg-surface p-4 transition-colors hover:border-brand/40 hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                    <span className="flex items-start justify-between gap-2">
                        <span className="font-display text-sm font-semibold text-ink">{destination.title}</span>
                        <ChevronRight className="size-4 shrink-0 text-ink-soft transition-colors group-hover:text-brand" aria-hidden="true" />
                    </span>
                    <span className="text-xs leading-snug text-ink-soft">{destination.description}</span>
                </Link>
            ))}
        </div>
    );
}
