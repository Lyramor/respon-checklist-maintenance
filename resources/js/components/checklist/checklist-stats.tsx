import type { Blueprint, ChecklistItem, Severity } from '@/types';

export type Answers = Record<string, string>;

export interface SectionStat {
    index: number;
    title: string;
    hint: string;
    total: number;
    answered: number;
    blanks: string[];
    complete: boolean;
}

export interface ChecklistStats {
    total: number;
    answered: number;
    blanks: string[];
    percent: number;
    counts: Record<Severity, number>;
    sections: SectionStat[];
}

export const SEVERITY_LABEL: Record<Severity, string> = {
    ok: 'Aman',
    warn: 'Perlu perhatian',
    bad: 'Bermasalah',
};

export function emptyAnswers(blueprint: Blueprint): Answers {
    const answers: Answers = {};

    for (const section of blueprint.sections) {
        for (const item of section.items) {
            answers[item.key] = '';
        }
    }

    return answers;
}

export function severityOf(blueprint: Blueprint, item: ChecklistItem, value: string): Severity | null {
    if (item.optionSet === null || value === '') {
        return null;
    }

    const set = blueprint.optionSets[item.optionSet];

    return set?.find((option) => option.value === value)?.severity ?? null;
}

export function fieldOrder(blueprint: Blueprint): string[] {
    const keys = ['nama_petugas', 'tanggal_pemeriksaan', 'week', 'line'];

    for (const section of blueprint.sections) {
        for (const item of section.items) {
            keys.push(item.key);
        }
    }

    return keys;
}

export function computeStats(blueprint: Blueprint, answers: Answers): ChecklistStats {
    const counts: Record<Severity, number> = { ok: 0, warn: 0, bad: 0 };
    const blanks: string[] = [];
    const sections: SectionStat[] = [];
    let total = 0;
    let answered = 0;

    blueprint.sections.forEach((section, index) => {
        const options = section.items.filter((item) => item.type === 'option');
        const sectionBlanks: string[] = [];

        for (const item of options) {
            const value = answers[item.key] ?? '';

            if (value === '') {
                sectionBlanks.push(item.key);
                continue;
            }

            const severity = severityOf(blueprint, item, value);

            if (severity !== null) {
                counts[severity] += 1;
            }
        }

        total += options.length;
        answered += options.length - sectionBlanks.length;
        blanks.push(...sectionBlanks);

        sections.push({
            index,
            title: section.title,
            hint: section.hint,
            total: options.length,
            answered: options.length - sectionBlanks.length,
            blanks: sectionBlanks,
            complete: sectionBlanks.length === 0 && options.length > 0,
        });
    });

    return {
        total,
        answered,
        blanks,
        percent: total === 0 ? 0 : Math.round((answered / total) * 100),
        counts,
        sections,
    };
}
