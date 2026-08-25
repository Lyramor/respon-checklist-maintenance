/**
 * Navigasi fokus untuk form checklist.
 *
 * Setiap baris item memakai id `row-<key>` sebagai target scroll dan
 * kontrol di dalamnya memakai id `<key>` sebagai target fokus.
 */

export function rowId(key: string): string {
    return `row-${key}`;
}

export function sectionId(index: number): string {
    return `bagian-${index + 1}`;
}

/** Ubah key error Inertia (`answers.apd`) menjadi key kontrol (`apd`). */
export function toFieldKey(errorKey: string): string {
    return errorKey.startsWith('answers.') ? errorKey.slice('answers.'.length) : errorKey;
}

export function jumpToField(key: string): void {
    if (typeof document === 'undefined') {
        return;
    }

    const row = document.getElementById(rowId(key));
    const control = document.getElementById(key);
    const target = row ?? control;

    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    window.setTimeout(() => {
        control?.focus({ preventScroll: true });
    }, 320);
}

export function jumpToSection(index: number): void {
    if (typeof document === 'undefined') {
        return;
    }

    document.getElementById(sectionId(index))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function firstInvalidKey(errors: Record<string, string | undefined>, order: string[]): string | null {
    const invalid = new Set(Object.keys(errors).map(toFieldKey));

    return order.find((key) => invalid.has(key)) ?? null;
}
