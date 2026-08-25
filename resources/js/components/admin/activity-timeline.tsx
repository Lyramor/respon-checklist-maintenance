import { EmptyState } from '@/components/ui/empty-state';
import type { ActivityEntry } from '@/types';

import { ActivityAction } from './activity-action';

interface DayGroup {
    key: string;
    label: string;
    entries: ActivityEntry[];
}

const DAY_FORMAT = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

function dayOf(value: string): { key: string; label: string } {
    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
        const key = `${parsed.getFullYear()}-${parsed.getMonth()}-${parsed.getDate()}`;

        return { key, label: DAY_FORMAT.format(parsed) };
    }

    const fallback = value.split(' ')[0] ?? value;

    return { key: fallback, label: fallback };
}

function group(entries: ActivityEntry[]): DayGroup[] {
    const groups: DayGroup[] = [];

    entries.forEach((entry) => {
        const day = dayOf(entry.created_at);
        const last = groups[groups.length - 1];

        if (last && last.key === day.key) {
            last.entries.push(entry);

            return;
        }

        groups.push({ key: day.key, label: day.label, entries: [entry] });
    });

    return groups;
}

export function ActivityTimeline({
    entries,
    filtered,
}: {
    entries: ActivityEntry[];
    filtered: boolean;
}) {
    if (entries.length === 0) {
        return (
            <div className="p-4">
                <EmptyState
                    title={filtered ? 'Tidak ada aktivitas yang cocok' : 'Log masih kosong'}
                    description={
                        filtered
                            ? 'Coba kata kunci lain, misalnya nama pengguna atau kata pada keterangan.'
                            : 'Setiap login, pengisian checklist, dan perubahan akun akan tercatat di sini.'
                    }
                />
            </div>
        );
    }

    return (
        <div className="border-t border-line">
            {group(entries).map((day) => (
                <section key={day.key}>
                    <h3 className="sticky top-0 z-[1] border-b border-line bg-brand-soft px-4 py-1.5 font-display text-[11px] font-semibold tracking-wide text-brand uppercase">
                        {day.label}
                    </h3>

                    <ul className="divide-y divide-line">
                        {day.entries.map((entry) => (
                            <li key={entry.id} className="px-4 py-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <ActivityAction action={entry.action} />
                                    <span className="text-sm font-medium text-ink">
                                        {entry.actor_name}
                                    </span>
                                </div>

                                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                                    {entry.description}
                                </p>

                                <p className="mt-1 font-mono text-[11px] text-ink-soft/80">
                                    {entry.created_at}
                                    {entry.ip_address ? ` / IP ${entry.ip_address}` : ' / IP tidak tercatat'}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}
