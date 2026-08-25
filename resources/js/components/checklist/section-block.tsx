import { Badge } from '@/components/ui/badge';
import { Card, CardBody } from '@/components/ui/card';
import type { Blueprint, ChecklistSection } from '@/types';
import type { Answers, SectionStat } from './checklist-stats';
import { sectionId } from './focus';
import { NoteItem } from './note-item';
import { OptionItem } from './option-item';

interface SectionBlockProps {
    blueprint: Blueprint;
    section: ChecklistSection;
    stat: SectionStat;
    answers: Answers;
    errors: Record<string, string | undefined>;
    onChange: (key: string, value: string) => void;
}

export function SectionBlock({ blueprint, section, stat, answers, errors, onChange }: SectionBlockProps) {
    const number = String(stat.index + 1).padStart(2, '0');

    return (
        <Card className="overflow-hidden">
            <header
                id={sectionId(stat.index)}
                data-section-index={stat.index}
                className="flex scroll-mt-4 flex-wrap items-start gap-x-4 gap-y-2 border-b border-line bg-brand-soft px-4 py-3.5 sm:px-5"
            >
                <span className="font-mono text-[13px] font-semibold tabular-nums text-brand">{number}</span>
                <div className="min-w-0 flex-1">
                    <h2 className="font-display text-[17px] font-semibold leading-tight text-ink sm:text-[19px]">
                        {section.title}
                    </h2>
                    <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">{section.hint}</p>
                </div>
                <Badge tone={stat.complete ? 'ok' : 'neutral'} className="shrink-0 font-mono tabular-nums">
                    {stat.answered} / {stat.total} terisi
                </Badge>
            </header>

            <CardBody className="px-4 py-1 sm:px-5">
                {section.items.map((item, itemIndex) => {
                    const code = `${number}.${itemIndex + 1}`;
                    const error = errors[`answers.${item.key}`];
                    const value = answers[item.key] ?? '';

                    return item.type === 'option' ? (
                        <OptionItem
                            key={item.key}
                            blueprint={blueprint}
                            item={item}
                            code={code}
                            value={value}
                            error={error}
                            onChange={onChange}
                        />
                    ) : (
                        <NoteItem key={item.key} item={item} code={code} value={value} error={error} onChange={onChange} />
                    );
                })}
            </CardBody>
        </Card>
    );
}
