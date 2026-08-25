export const WEEKS: number[] = [1, 2, 3, 4, 5];

export const LINES: number[] = [1, 2, 3, 5];

export interface MonthOption {
    value: number;
    label: string;
}

export const MONTHS: MonthOption[] = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
];

export function monthLabel(month: number): string {
    return MONTHS.find((m) => m.value === month)?.label ?? String(month);
}

export function yearRange(current: number, back = 3, forward = 1): number[] {
    const years: number[] = [];

    for (let y = current - back; y <= current + forward; y += 1) {
        years.push(y);
    }

    return years;
}
