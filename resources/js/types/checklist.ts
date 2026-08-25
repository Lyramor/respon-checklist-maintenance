export type Severity = 'ok' | 'warn' | 'bad';

export interface ChecklistOption {
    value: string;
    severity: Severity;
}

export type OptionSets = Record<string, ChecklistOption[]>;

export interface ChecklistItem {
    key: string;
    label: string;
    type: 'option' | 'note';
    optionSet: string | null;
}

export interface ChecklistSection {
    title: string;
    hint: string;
    items: ChecklistItem[];
}

export interface Blueprint {
    sections: ChecklistSection[];
    optionSets: OptionSets;
    weeks: number[];
    lines: number[];
    /** '1' -> 'Januari' */
    months: Record<string, string>;
}

export interface SubmissionSummary {
    id: number;
    nama_petugas: string;
    tanggal_pemeriksaan: string;
    week: number;
    line: number;
    period_year: number;
    period_month: number;
    period_label: string;
    author: string | null;
    counts: { ok: number; warn: number; bad: number };
    created_at: string;
}

export interface SubmissionDetail extends SubmissionSummary {
    answers: Record<string, string | null>;
}
