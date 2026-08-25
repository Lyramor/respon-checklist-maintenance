import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { routes } from '@/routes';

import { LINES, MONTHS, WEEKS } from './constants';

export interface SubmissionFilterState {
    week?: number | null;
    line?: number | null;
    month?: number | null;
    year?: number | null;
    q?: string | null;
}

type Query = Record<string, string | number>;

function buildQuery(state: SubmissionFilterState): Query {
    const query: Query = {};

    if (state.week) query.week = state.week;
    if (state.line) query.line = state.line;
    if (state.month) {
        query.month = state.month;
        query.year = state.year ?? new Date().getFullYear();
    }
    if (state.q && state.q.trim() !== '') query.q = state.q.trim();

    return query;
}

function visit(state: SubmissionFilterState): void {
    router.get(routes.admin.submissions(), buildQuery(state), {
        preserveState: true,
        preserveScroll: true,
        replace: true,
    });
}

export function SubmissionFilters({ filters }: { filters: SubmissionFilterState }) {
    const [term, setTerm] = useState<string>(filters.q ?? '');

    const active =
        Boolean(filters.week) ||
        Boolean(filters.line) ||
        Boolean(filters.month) ||
        Boolean(filters.q);

    const change = (patch: Partial<SubmissionFilterState>): void => {
        visit({ ...filters, q: term, ...patch });
    };

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        visit({ ...filters, q: term });
    };

    return (
        <form
            onSubmit={submit}
            className="grid grid-cols-2 gap-2 border-b border-line bg-canvas/60 p-3 sm:grid-cols-4 lg:grid-cols-[repeat(3,minmax(0,150px))_1fr_auto]"
        >
            <Select
                aria-label="Saring berdasarkan minggu"
                placeholder="Semua minggu"
                value={filters.week ?? ''}
                onChange={(e) => change({ week: e.target.value ? Number(e.target.value) : null })}
                options={WEEKS.map((w) => ({ value: String(w), label: `Minggu ${w}` }))}
            />

            <Select
                aria-label="Saring berdasarkan line"
                placeholder="Semua line"
                value={filters.line ?? ''}
                onChange={(e) => change({ line: e.target.value ? Number(e.target.value) : null })}
                options={LINES.map((l) => ({ value: String(l), label: `LINE ${l}` }))}
            />

            <Select
                aria-label="Saring berdasarkan bulan"
                placeholder="Semua bulan"
                value={filters.month ?? ''}
                onChange={(e) => change({ month: e.target.value ? Number(e.target.value) : null })}
                options={MONTHS.map((m) => ({ value: String(m.value), label: m.label }))}
            />

            <div className="col-span-2 sm:col-span-4 lg:col-span-1">
                <Input
                    type="search"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="Cari nama petugas atau pengisi"
                    aria-label="Cari nama petugas atau pengisi"
                />
            </div>

            <div className="col-span-2 flex gap-2 sm:col-span-4 lg:col-span-1">
                <Button type="submit" size="sm">
                    <Search className="h-4 w-4" aria-hidden="true" />
                    Cari
                </Button>

                {active ? (
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            setTerm('');
                            visit({});
                        }}
                    >
                        Reset
                    </Button>
                ) : null}
            </div>
        </form>
    );
}
