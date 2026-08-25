import { cn } from '@/lib/cn';
import type { ChecklistStats } from './checklist-stats';

interface ProgressRailProps {
    stats: ChecklistStats;
    activeIndex: number;
    onJumpSection: (index: number) => void;
}

/**
 * Rel progres: satu segmen per bagian, lebarnya sebanding dengan jumlah item
 * wajib di bagian itu. Segmen bisa ditekan untuk melompat ke bagiannya.
 */
export function ProgressRail({ stats, activeIndex, onJumpSection }: ProgressRailProps) {
    const active = stats.sections[activeIndex];

    return (
        <div>
            <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 truncate text-[12px] leading-tight text-ink-soft">
                    <span className="font-mono tabular-nums text-brand">
                        {String(activeIndex + 1).padStart(2, '0')}/{String(stats.sections.length).padStart(2, '0')}
                    </span>{' '}
                    <span className="text-ink">{active?.title ?? 'Checklist'}</span>
                </p>
                <p className="shrink-0 font-mono text-[12px] tabular-nums text-ink-soft">
                    <span className="text-ink">{stats.answered}</span>/{stats.total} terisi
                </p>
            </div>

            <div className="mt-1 flex items-stretch gap-1">
                {stats.sections.map((section) => {
                    const percent = section.total === 0 ? 0 : (section.answered / section.total) * 100;

                    return (
                        <button
                            key={section.index}
                            type="button"
                            style={{ flexGrow: section.total }}
                            className="group flex-1 basis-0 py-2"
                            aria-label={`Ke bagian ${section.title}, ${section.answered} dari ${section.total} terisi`}
                            onClick={() => onJumpSection(section.index)}
                        >
                            <span
                                className={cn(
                                    'block h-1.5 w-full overflow-hidden rounded-full bg-line',
                                    section.index === activeIndex ? 'ring-1 ring-brand/50' : null,
                                )}
                            >
                                <span
                                    className={cn(
                                        'block h-full rounded-full transition-[width] duration-300',
                                        section.complete ? 'bg-ok' : 'bg-brand',
                                    )}
                                    style={{ width: `${percent}%` }}
                                />
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
