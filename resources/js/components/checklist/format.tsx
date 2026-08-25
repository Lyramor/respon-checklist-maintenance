/** Pemformat teks yang dipakai bersama oleh modal konfirmasi dan halaman berhasil. */

export function formatTanggal(value: string): string {
    if (value === '') {
        return 'Belum dipilih';
    }

    const parsed = new Date(`${value}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(parsed);
}

export function weekLabel(week: number): string {
    return `Week ${week}`;
}

export function lineLabel(line: number): string {
    return `Line ${line}`;
}
