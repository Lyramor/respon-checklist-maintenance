import type { Blueprint } from '@/types';

interface ChecklistIntroProps {
    blueprint: Blueprint;
}

export function ChecklistIntro({ blueprint }: ChecklistIntroProps) {
    const items = blueprint.sections.flatMap((section) => section.items);
    const required = items.filter((item) => item.type === 'option').length;
    const notes = items.length - required;

    return (
        <div className="mb-4 border-l-2 border-brand pl-4">
            <p className="text-[14px] leading-relaxed text-ink-soft">
                {blueprint.sections.length} bagian, {required} item wajib dipilih dan {notes} kolom keterangan yang
                boleh dikosongkan. Setelah dikirim, isian ini menempati baris Week dan Line yang dipilih pada laporan
                bulanan.
            </p>
        </div>
    );
}
