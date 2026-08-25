import { useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { routes } from '@/routes';
import type { Blueprint } from '@/types';
import { ChecklistDock } from './checklist-dock';
import { computeStats, emptyAnswers, fieldOrder, type Answers } from './checklist-stats';
import { ConfirmSubmitModal } from './confirm-submit-modal';
import { ErrorSummary } from './error-summary';
import { firstInvalidKey, jumpToField } from './focus';
import { IdentityPanel } from './identity-panel';
import { SectionBlock } from './section-block';

export interface ChecklistDefaults {
    nama_petugas: string;
    tanggal_pemeriksaan: string;
}

interface ChecklistFormProps {
    blueprint: Blueprint;
    defaults: ChecklistDefaults;
}

type ChecklistFormData = {
    nama_petugas: string;
    tanggal_pemeriksaan: string;
    week: number;
    line: number;
    answers: Answers;
};

const IDENTITY_LABELS: Record<string, string> = {
    nama_petugas: 'Nama petugas',
    tanggal_pemeriksaan: 'Tanggal pemeriksaan',
    week: 'Week',
    line: 'Line',
};

export function ChecklistForm({ blueprint, defaults }: ChecklistFormProps) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [attempted, setAttempted] = useState(false);

    const form = useForm<ChecklistFormData>({
        nama_petugas: defaults.nama_petugas,
        tanggal_pemeriksaan: defaults.tanggal_pemeriksaan,
        week: blueprint.weeks[0] ?? 1,
        line: blueprint.lines[0] ?? 1,
        answers: emptyAnswers(blueprint),
    });

    const errors = form.errors as Record<string, string | undefined>;
    const order = useMemo(() => fieldOrder(blueprint), [blueprint]);
    const stats = useMemo(() => computeStats(blueprint, form.data.answers), [blueprint, form.data.answers]);

    const clearError = (errorKey: string) => {
        if (errors[errorKey] !== undefined) {
            form.clearErrors(errorKey as unknown as keyof ChecklistFormData);
        }
    };

    const setAnswer = (key: string, value: string) => {
        clearError(`answers.${key}`);
        form.setData('answers', { ...form.data.answers, [key]: value });
    };

    const setText = (key: 'nama_petugas' | 'tanggal_pemeriksaan', value: string) => {
        clearError(key);
        form.setData(key, value);
    };

    const setNumber = (key: 'week' | 'line', value: number) => {
        clearError(key);
        form.setData(key, value);
    };

    const identityIssues = Object.keys(IDENTITY_LABELS)
        .filter((key) => errors[key] !== undefined)
        .map((key) => `${IDENTITY_LABELS[key]}: ${errors[key]}`);

    const jumpToFirstIssue = () => {
        const serverKey = firstInvalidKey(errors, order);
        const target = serverKey ?? stats.blanks[0] ?? null;

        if (target !== null) {
            jumpToField(target);
        }
    };

    const submit = () => {
        form.post(routes.checklist.store(), {
            preserveScroll: true,
            onError: (bag) => {
                setConfirmOpen(false);
                setAttempted(true);

                const key = firstInvalidKey(bag as Record<string, string | undefined>, order);

                if (key !== null) {
                    jumpToField(key);
                }
            },
        });
    };

    const fixBlanks = () => {
        setConfirmOpen(false);
        setAttempted(true);

        if (stats.blanks.length > 0) {
            jumpToField(stats.blanks[0]);
        }
    };

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                setConfirmOpen(true);
            }}
            className="grid gap-4"
        >
            {attempted ? (
                <ErrorSummary
                    blankCount={stats.blanks.length}
                    total={stats.total}
                    identityIssues={identityIssues}
                    onJump={jumpToFirstIssue}
                />
            ) : null}

            <IdentityPanel
                values={{
                    nama_petugas: form.data.nama_petugas,
                    tanggal_pemeriksaan: form.data.tanggal_pemeriksaan,
                    week: form.data.week,
                    line: form.data.line,
                }}
                weeks={blueprint.weeks}
                lines={blueprint.lines}
                errors={errors}
                onText={setText}
                onNumber={setNumber}
            />

            {blueprint.sections.map((section, index) => (
                <SectionBlock
                    key={section.title}
                    blueprint={blueprint}
                    section={section}
                    stat={stats.sections[index]}
                    answers={form.data.answers}
                    errors={errors}
                    onChange={setAnswer}
                />
            ))}

            <ChecklistDock stats={stats} processing={form.processing} onOpenConfirm={() => setConfirmOpen(true)} />

            <ConfirmSubmitModal
                open={confirmOpen}
                stats={stats}
                identity={{
                    nama_petugas: form.data.nama_petugas,
                    tanggal_pemeriksaan: form.data.tanggal_pemeriksaan,
                    week: form.data.week,
                    line: form.data.line,
                }}
                processing={form.processing}
                onClose={() => setConfirmOpen(false)}
                onConfirm={submit}
                onFixBlanks={fixBlanks}
            />
        </form>
    );
}
