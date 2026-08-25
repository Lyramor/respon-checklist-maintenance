import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Select } from '@/components/ui/select';
import { routes } from '@/routes';
import type { Role } from '@/types';

interface FormShape {
    name: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: Role;
    [key: string]: string;
}

const BLANK: FormShape = {
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'responden',
};

export function UserCreatePanel() {
    const { data, setData, post, processing, errors, reset } = useForm<FormShape>({ ...BLANK });

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        post(routes.admin.users(), {
            preserveScroll: true,
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <Card>
            <CardHeader
                title="Buat akun"
                description="Akun responden hanya bisa mengisi form checklist dan melihat riwayat isiannya sendiri. Akun admin bisa membuka semua menu pengelolaan."
            />

            <CardBody>
                <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nama lengkap" htmlFor="name" error={errors.name} required>
                        <Input
                            id="name"
                            value={data.name}
                            invalid={Boolean(errors.name)}
                            autoComplete="name"
                            onChange={(e) => setData('name', e.target.value)}
                        />
                    </Field>

                    <Field
                        label="Username"
                        htmlFor="username"
                        error={errors.username}
                        hint="Dipakai untuk masuk, tanpa spasi."
                        required
                    >
                        <Input
                            id="username"
                            value={data.username}
                            invalid={Boolean(errors.username)}
                            autoComplete="off"
                            onChange={(e) => setData('username', e.target.value)}
                        />
                    </Field>

                    <Field label="Email" htmlFor="email" error={errors.email} required>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            invalid={Boolean(errors.email)}
                            autoComplete="off"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </Field>

                    <Field
                        label="Peran"
                        htmlFor="role"
                        error={errors.role}
                        hint="Pilih responden untuk petugas lapangan."
                        required
                    >
                        <Select
                            id="role"
                            value={data.role}
                            invalid={Boolean(errors.role)}
                            onChange={(e) => setData('role', e.target.value as Role)}
                            options={[
                                { value: 'responden', label: 'Responden (isi form saja)' },
                                { value: 'admin', label: 'Admin (akses penuh)' },
                            ]}
                        />
                    </Field>

                    <Field
                        label="Kata sandi"
                        htmlFor="password"
                        error={errors.password}
                        hint="Minimal 8 karakter."
                        required
                    >
                        <PasswordInput
                            id="password"
                            value={data.password}
                            invalid={Boolean(errors.password)}
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                    </Field>

                    <Field
                        label="Ulangi kata sandi"
                        htmlFor="password_confirmation"
                        error={errors.password_confirmation}
                        required
                    >
                        <PasswordInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            invalid={Boolean(errors.password_confirmation)}
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                    </Field>

                    <div className="sm:col-span-2">
                        <Button type="submit" loading={processing} disabled={processing}>
                            Simpan akun
                        </Button>
                    </div>
                </form>
            </CardBody>
        </Card>
    );
}
