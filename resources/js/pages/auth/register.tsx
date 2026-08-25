import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { cn } from '@/lib/cn';
import AuthLayout from '@/layouts/auth-layout';
import { routes } from '@/routes';
import type { SharedProps } from '@/types';

interface RegisterForm {
    name: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    [key: string]: string;
}

type StrengthTone = 'bad' | 'warn' | 'ok';

interface Strength {
    filled: number;
    label: string;
    tone: StrengthTone;
}

function measure(value: string): Strength | null {
    if (value.length === 0) {
        return null;
    }

    if (value.length < 8) {
        return { filled: 1, label: 'Minimal 8 karakter', tone: 'bad' };
    }

    let points = 0;
    if (value.length >= 12) points += 1;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) points += 1;
    if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) points += 1;

    if (points <= 1) {
        return { filled: 2, label: 'Cukup, tambahkan angka atau huruf besar', tone: 'warn' };
    }

    return { filled: 3, label: 'Kata sandi sudah kuat', tone: 'ok' };
}

const barTone: Record<StrengthTone, string> = {
    bad: 'bg-bad',
    warn: 'bg-warn',
    ok: 'bg-ok',
};

const textTone: Record<StrengthTone, string> = {
    bad: 'text-bad',
    warn: 'text-warn',
    ok: 'text-ok',
};

function StrengthHint({ strength }: { strength: Strength }) {
    return (
        <div className="mt-2 flex items-center gap-3">
            <div className="flex w-24 gap-1" aria-hidden="true">
                {[0, 1, 2].map((index) => (
                    <span
                        key={index}
                        className={cn(
                            'h-[3px] flex-1 rounded-full',
                            index < strength.filled ? barTone[strength.tone] : 'bg-line',
                        )}
                    />
                ))}
            </div>
            <span className={cn('text-xs', textTone[strength.tone])}>{strength.label}</span>
        </div>
    );
}

export default function Register() {
    const { flash } = usePage<SharedProps>().props;
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const strength = measure(data.password);
    const mismatch =
        data.password_confirmation.length > 0 && data.password_confirmation !== data.password
            ? 'Konfirmasi belum sama dengan kata sandi di atas.'
            : undefined;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post(routes.register(), {
            preserveScroll: true,
            onFinish: () => reset('password', 'password_confirmation'),
        });
    }

    return (
        <AuthLayout
            title="Daftar akun responden"
            subtitle="Buat akun untuk mengisi checklist monitoring maintenance mingguan di line yang kamu tangani."
        >
            <Head title="Daftar" />

            {flash?.error ? (
                <p
                    role="alert"
                    className="mb-5 rounded-[4px] border border-bad/30 bg-bad-soft px-3 py-2.5 text-sm text-bad"
                >
                    {flash.error}
                </p>
            ) : null}

            <p className="mb-5 rounded-[4px] border border-line bg-canvas px-3 py-2.5 text-xs leading-relaxed text-ink-soft">
                Akun baru otomatis terdaftar sebagai responden, jadi aksesnya hanya mengisi form checklist dan melihat
                riwayat isian sendiri. Pengelolaan akun, laporan bulanan dan data seluruh responden dipegang admin.
            </p>

            <form onSubmit={submit} noValidate className="space-y-4">
                <Field label="Nama Lengkap" htmlFor="name" required error={errors.name}>
                    <Input
                        id="name"
                        name="name"
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        invalid={Boolean(errors.name)}
                        autoComplete="name"
                        placeholder="Nama sesuai daftar petugas"
                    />
                </Field>

                <Field
                    label="Username"
                    htmlFor="username"
                    required
                    error={errors.username}
                    hint="Dipakai untuk masuk. Huruf kecil tanpa spasi."
                >
                    <Input
                        id="username"
                        name="username"
                        value={data.username}
                        onChange={(event) => setData('username', event.target.value)}
                        invalid={Boolean(errors.username)}
                        autoComplete="username"
                        placeholder="mis. budi.santoso"
                    />
                </Field>

                <Field label="Email" htmlFor="email" required error={errors.email}>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        invalid={Boolean(errors.email)}
                        autoComplete="email"
                        placeholder="nama@perusahaan.co.id"
                    />
                </Field>

                <div>
                    <Field label="Kata Sandi" htmlFor="password" required error={errors.password}>
                        <PasswordInput
                            id="password"
                            name="password"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            invalid={Boolean(errors.password)}
                            autoComplete="new-password"
                            placeholder="Minimal 8 karakter"
                        />
                    </Field>
                    {strength && !errors.password ? <StrengthHint strength={strength} /> : null}
                </div>

                <Field
                    label="Konfirmasi Kata Sandi"
                    htmlFor="password_confirmation"
                    required
                    error={errors.password_confirmation ?? mismatch}
                >
                    <PasswordInput
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(event) => setData('password_confirmation', event.target.value)}
                        invalid={Boolean(errors.password_confirmation) || Boolean(mismatch)}
                        autoComplete="new-password"
                        placeholder="Ketik ulang kata sandi"
                    />
                </Field>

                <Button type="submit" loading={processing} className="w-full">
                    Daftar akun
                </Button>
            </form>

            <p className="mt-6 text-sm text-ink-soft">
                Sudah punya akun?{' '}
                <Link href={routes.login()} className="font-medium text-brand underline underline-offset-4">
                    Masuk di sini
                </Link>
            </p>
        </AuthLayout>
    );
}
