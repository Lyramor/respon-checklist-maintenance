import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { routes } from '@/routes';

export function ActivityToolbar({ q }: { q: string | null | undefined }) {
    const [term, setTerm] = useState<string>(q ?? '');

    const visit = (value: string): void => {
        const trimmed = value.trim();

        router.get(
            routes.admin.activity(),
            trimmed === '' ? {} : { q: trimmed },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        visit(term);
    };

    return (
        <form
            onSubmit={submit}
            className="flex flex-col gap-2 border-b border-line bg-canvas/60 p-3 sm:flex-row sm:items-center"
        >
            <Input
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Cari pelaku, jenis aksi, atau keterangan"
                aria-label="Cari aktivitas"
                className="sm:max-w-[360px]"
            />

            <div className="flex gap-2">
                <Button type="submit" size="sm">
                    <Search className="h-4 w-4" aria-hidden="true" />
                    Cari
                </Button>

                {q ? (
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            setTerm('');
                            visit('');
                        }}
                    >
                        Reset
                    </Button>
                ) : null}
            </div>
        </form>
    );
}
