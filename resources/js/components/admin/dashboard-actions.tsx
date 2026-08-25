import { Link } from '@inertiajs/react';
import { FileSpreadsheet, PenLine } from 'lucide-react';

import { routes } from '@/routes';

const BASE =
    'inline-flex items-center justify-center gap-2 rounded-[4px] border px-3.5 py-2 text-sm font-medium transition-colors';

export function DashboardActions({ periodLabel }: { periodLabel: string }) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link
                href={routes.checklist.create()}
                className={`${BASE} border-brand bg-brand text-surface hover:bg-brand-ink`}
            >
                <PenLine className="h-4 w-4" aria-hidden="true" />
                Isi checklist
            </Link>

            <Link
                href={routes.admin.reports()}
                className={`${BASE} border-line bg-surface text-ink hover:border-brand hover:text-brand`}
            >
                <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                Export laporan {periodLabel}
            </Link>
        </div>
    );
}
