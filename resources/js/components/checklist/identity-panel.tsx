import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ChoiceRow } from './choice-row';
import { rowId } from './focus';

export interface IdentityValues {
    nama_petugas: string;
    tanggal_pemeriksaan: string;
    week: number;
    line: number;
}

interface IdentityPanelProps {
    values: IdentityValues;
    weeks: number[];
    lines: number[];
    errors: Record<string, string | undefined>;
    onText: (key: 'nama_petugas' | 'tanggal_pemeriksaan', value: string) => void;
    onNumber: (key: 'week' | 'line', value: number) => void;
}

export function IdentityPanel({ values, weeks, lines, errors, onText, onNumber }: IdentityPanelProps) {
    return (
        <Card>
            <CardHeader
                title="Identitas pemeriksaan"
                description="Empat data ini dipakai untuk menempatkan isian pada baris yang benar di laporan bulanan."
            />
            <CardBody className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <div id={rowId('nama_petugas')} className="scroll-mt-24">
                        <Field label="Nama petugas" htmlFor="nama_petugas" error={errors.nama_petugas} required>
                            <Input
                                id="nama_petugas"
                                name="nama_petugas"
                                value={values.nama_petugas}
                                invalid={Boolean(errors.nama_petugas)}
                                autoComplete="name"
                                placeholder="Nama lengkap petugas maintenance"
                                onChange={(event) => onText('nama_petugas', event.target.value)}
                            />
                        </Field>
                    </div>

                    <div id={rowId('tanggal_pemeriksaan')} className="scroll-mt-24">
                        <Field
                            label="Tanggal pemeriksaan"
                            htmlFor="tanggal_pemeriksaan"
                            error={errors.tanggal_pemeriksaan}
                            required
                        >
                            <Input
                                id="tanggal_pemeriksaan"
                                name="tanggal_pemeriksaan"
                                type="date"
                                value={values.tanggal_pemeriksaan}
                                invalid={Boolean(errors.tanggal_pemeriksaan)}
                                onChange={(event) => onText('tanggal_pemeriksaan', event.target.value)}
                            />
                        </Field>
                    </div>
                </div>

                <div id={rowId('week')} className="scroll-mt-24">
                    <Field label="Week" htmlFor="week" hint="Minggu ke berapa dalam bulan berjalan." error={errors.week} required>
                        <ChoiceRow
                            id="week"
                            name="Week"
                            values={weeks}
                            value={values.week}
                            columns={5}
                            invalid={Boolean(errors.week)}
                            formatLabel={(week) => `W${week}`}
                            onChange={(week) => onNumber('week', week)}
                        />
                    </Field>
                </div>

                <div id={rowId('line')} className="scroll-mt-24">
                    <Field label="Line" htmlFor="line" hint="Line produksi yang diperiksa." error={errors.line} required>
                        <ChoiceRow
                            id="line"
                            name="Line"
                            values={lines}
                            value={values.line}
                            columns={4}
                            invalid={Boolean(errors.line)}
                            formatLabel={(line) => `Line ${line}`}
                            onChange={(line) => onNumber('line', line)}
                        />
                    </Field>
                </div>
            </CardBody>
        </Card>
    );
}
