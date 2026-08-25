import { router } from '@inertiajs/react';
import { FileSpreadsheet } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Select } from '@/components/ui/select';
import { routes } from '@/routes';
import type { ReportPeriod } from '@/types';

import { MONTHS, monthLabel, yearRange } from './constants';

export function ReportExportPanel({
    periods,
    defaults,
    years,
}: {
    periods: ReportPeriod[];
    defaults: { year: number; month: number };
    years: number[];
}) {
    const [year, setYear] = useState<number>(defaults.year);
    const [month, setMonth] = useState<number>(defaults.month);
    const [processing, setProcessing] = useState<boolean>(false);

    const options = years.length > 0 ? years : yearRange(defaults.year);
    const found = periods.find((p) => p.year === year && p.month === month);
    const count = found?.submissions ?? 0;

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        router.post(
            routes.admin.reportGenerate(),
            { year, month },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Card>
            <CardHeader
                title="Export laporan bulanan"
                description="File yang dihasilkan mengikuti format Excel yang sudah dipakai tim, lengkap dengan warna, dropdown, dan susunan kolom yang sama."
            />

            <CardBody>
                <form onSubmit={submit} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Field label="Bulan" htmlFor="report-month">
                        <Select
                            id="report-month"
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            options={MONTHS.map((m) => ({
                                value: String(m.value),
                                label: m.label,
                            }))}
                        />
                    </Field>

                    <Field label="Tahun" htmlFor="report-year">
                        <Select
                            id="report-year"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            options={options.map((y) => ({ value: String(y) }))}
                        />
                    </Field>

                    <div className="col-span-2 flex items-end lg:col-span-2">
                        <Button type="submit" loading={processing} disabled={processing}>
                            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                            Export laporan
                        </Button>
                    </div>
                </form>

                <p className="mt-4 rounded-[6px] border border-line bg-canvas px-3 py-2 text-sm text-ink-soft">
                    {count > 0 ? (
                        <>
                            {monthLabel(month)} {year} punya{' '}
                            <span className="font-mono font-semibold text-ink">{count}</span>{' '}
                            checklist yang akan ikut masuk ke file.
                        </>
                    ) : (
                        <>
                            Belum ada checklist untuk {monthLabel(month)} {year}. Export tetap bisa
                            dijalankan dan hasilnya berupa template kosong untuk bulan tersebut.
                        </>
                    )}
                </p>
            </CardBody>
        </Card>
    );
}
