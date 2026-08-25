import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import type { Blueprint, ChecklistItem, OptionSets } from '@/types';

import { resolveSeverity, severityBox } from './severity';

type Answers = Record<string, string | null>;

function OptionAnswer({
    item,
    value,
    optionSets,
}: {
    item: ChecklistItem;
    value: string | null;
    optionSets: OptionSets;
}) {
    const severity = resolveSeverity(optionSets, item.optionSet, value);

    return (
        <div className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-4">
            <p className="text-sm leading-relaxed text-ink">{item.label}</p>

            <span
                className={cn(
                    'inline-flex w-fit rounded-[4px] border px-2.5 py-1 text-xs font-semibold sm:max-w-[260px] sm:justify-self-end',
                    severity
                        ? severityBox[severity]
                        : 'border-line bg-canvas text-ink-soft',
                )}
            >
                {value && value !== '' ? value : 'Belum dijawab'}
            </span>
        </div>
    );
}

function NoteAnswer({ item, value }: { item: ChecklistItem; value: string | null }) {
    const text = value?.trim() ?? '';

    return (
        <div className="bg-canvas/60 px-4 py-3">
            <p className="font-display text-[11px] font-semibold tracking-wide text-ink-soft uppercase">
                {item.label}
            </p>

            {text === '' ? (
                <p className="mt-1 text-sm text-ink-soft/70 italic">Tidak ada catatan</p>
            ) : (
                <blockquote className="mt-1.5 border-l-2 border-brand/40 pl-3 text-sm leading-relaxed text-ink">
                    {text}
                </blockquote>
            )}
        </div>
    );
}

export function SubmissionSections({
    blueprint,
    answers,
}: {
    blueprint: Blueprint;
    answers: Answers;
}) {
    return (
        <div className="space-y-4">
            {blueprint.sections.map((section, index) => (
                <Card key={section.title}>
                    <CardHeader
                        title={`${index + 1}. ${section.title}`}
                        description={section.hint}
                    />

                    <div className="divide-y divide-line border-t border-line">
                        {section.items.map((item) =>
                            item.type === 'note' ? (
                                <NoteAnswer
                                    key={item.key}
                                    item={item}
                                    value={answers[item.key] ?? null}
                                />
                            ) : (
                                <OptionAnswer
                                    key={item.key}
                                    item={item}
                                    value={answers[item.key] ?? null}
                                    optionSets={blueprint.optionSets}
                                />
                            ),
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
}

export function SubmissionSectionsEmpty() {
    return (
        <Card>
            <CardBody>
                <p className="text-sm text-ink-soft">
                    Isian checklist ini belum bisa ditampilkan karena struktur formulir tidak
                    terbaca. Muat ulang halaman atau hubungi admin sistem.
                </p>
            </CardBody>
        </Card>
    );
}
