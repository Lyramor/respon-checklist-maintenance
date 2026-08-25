import { Textarea } from '@/components/ui/textarea';
import type { ChecklistItem } from '@/types';
import { ItemRow } from './item-row';

const MAX_LENGTH = 500;

interface NoteItemProps {
    item: ChecklistItem;
    code: string;
    value: string;
    error?: string;
    onChange: (key: string, value: string) => void;
}

export function NoteItem({ item, code, value, error, onChange }: NoteItemProps) {
    const used = value.length;

    return (
        <ItemRow
            itemKey={item.key}
            code={code}
            label={item.label}
            hint="Opsional. Isi hanya bila ada hal yang perlu dicatat."
            error={error}
        >
            <Textarea
                id={item.key}
                name={item.key}
                rows={3}
                value={value}
                maxLength={MAX_LENGTH}
                invalid={Boolean(error)}
                placeholder="Tulis catatan singkat, misalnya lokasi temuan atau tindakan yang sudah diambil."
                onChange={(event) => onChange(item.key, event.target.value)}
                className="w-full"
            />
            <p className="mt-1.5 text-right font-mono text-[11px] tabular-nums text-ink-soft">
                {used} / {MAX_LENGTH}
            </p>
        </ItemRow>
    );
}
