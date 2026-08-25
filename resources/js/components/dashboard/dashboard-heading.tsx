import type { Role } from '@/types';

interface DashboardHeadingProps {
    name: string;
    role: Role;
    periodLabel?: string;
}

const intro: Record<Role, string> = {
    admin: 'Pantau pengisian checklist tiap minggu dan line, lalu tarik rekapnya jadi laporan bulanan.',
    responden: 'Kirim checklist untuk line yang kamu tangani dan lihat kembali isian yang sudah masuk.',
};

export function DashboardHeading({ name, role, periodLabel }: DashboardHeadingProps) {
    const firstName = name.trim().split(' ')[0] || 'Petugas';

    return (
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-line pb-5">
            <div>
                <h1 className="font-display text-[clamp(22px,4vw,30px)] font-semibold leading-tight text-ink">
                    Halo, {firstName}
                </h1>
                <p className="mt-1.5 max-w-[56ch] text-sm leading-relaxed text-ink-soft">{intro[role]}</p>
            </div>

            <p className="rounded-full border border-line bg-surface px-3 py-1 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-soft">
                {role === 'admin' ? 'Admin' : 'Responden'}
                {periodLabel ? ` · ${periodLabel}` : ''}
            </p>
        </div>
    );
}
