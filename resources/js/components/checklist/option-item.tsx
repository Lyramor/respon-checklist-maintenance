import { Select } from '@/components/ui/select';
import type { Blueprint, ChecklistItem } from '@/types';
import { SEVERITY_LABEL, severityOf } from './checklist-stats';
import { ItemRow } from './item-row';

interface OptionItemProps {
    blueprint: Blueprint;
    item: ChecklistItem;
    code: string;
    value: string;
    error?: string;
    onChange: (key: string, value: string) => void;
}

const SEVERITY_TEXT = {
    ok: 'text-ok',
    warn: 'text-warn',
    bad: 'text-bad',
} as const;

export function OptionItem({ blueprint, item, code, value, error, onChange }: OptionItemProps) {
    const options = item.optionSet === null ? [] : (blueprint.optionSets[item.optionSet] ?? []);
    const severity = severityOf(blueprint, item, value);

    return (
        <ItemRow itemKey={item.key} code={code} label={item.label} required error={error}>
            <Select
                id={item.key}
                name={item.key}
                value={value}
                invalid={Boolean(error)}
                severity={severity}
                placeholder="Pilih kondisi"
                options={options.map((option) => ({ value: option.value }))}
                onChange={(event) => onChange(item.key, event.target.value)}
                className="w-full sm:max-w-[440px]"
            />
            {severity !== null ? (
                <p className={`mt-1.5 font-mono text-[11px] uppercase tracking-wide ${SEVERITY_TEXT[severity]}`}>
                    {SEVERITY_LABEL[severity]}
                </p>
            ) : null}
        </ItemRow>
    );
}
