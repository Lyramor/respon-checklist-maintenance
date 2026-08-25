import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import AuthLayout from '@/layouts/auth-layout';
import { routes } from '@/routes';
import type { SharedProps } from '@/types';

interface DemoAccount {
    username: string;
    password: string;
}

interface LoginProps {
    demo?: DemoAccount | null;
}

interface LoginForm {
    login: string;
    password: string;
    remember: boolean;
    [key: string]: string | boolean;
}

export default function Login({ demo = null }: LoginProps) {
    const { flash } = usePage<SharedProps>().props;
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        login: '',
        password: '',
        remember: false,
    });

    const banner = flash?.error ?? errors.login ?? null;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post(routes.login(), {
            preserveScroll: true,
            onFinish: () => reset('password'),
        });
    }

    return (
        <AuthLayout
            title="Masuk ke Checklist Maintenance"
            subtitle="Pakai username atau email yang sudah didaftarkan admin. Satu akun untuk mengisi checklist mingguan dan melihat riwayat isianmu."
        >
            <Head title="Masuk" />

            {banner ? (
                <p
                    role="alert"
                    className="mb-5 rounded-[4px] border border-bad/30 bg-bad-soft px-3 py-2.5 text-sm text-bad"
                >
                    {banner}
                </p>
            ) : null}

            <form onSubmit={submit} noValidate className="space-y-4">
                <Field
                    label="Username atau Email"
                    htmlFor="login"
                    required
                    error={errors.login ? 'Isian ini belum cocok. Periksa lagi username atau emailmu.' : undefined}
                >
                    <Input
                        id="login"
                        name="login"
                        value={data.login}
                        onChange={(event) => setData('login', event.target.value)}
                        invalid={Boolean(errors.login)}
                        autoComplete="username"
                        autoFocus
                        placeholder="mis. budi.santoso"
                    />
                </Field>

                <Field
                    label="Kata Sandi"
                    htmlFor="password"
                    required
                    error={errors.password ? 'Kata sandi belum benar. Coba ketik ulang.' : undefined}
                >
                    <PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        onChange={(event) => setData('password', event.target.value)}
                        invalid={Boolean(errors.password)}
                        autoComplete="current-password"
                        placeholder="Kata sandi akun"
                    />
                </Field>

                <label htmlFor="remember" className="flex w-fit items-center gap-2 text-sm text-ink-soft">
                    <input
                        id="remember"
                        name="remember"
                        type="checkbox"
                        checked={data.remember}
                        onChange={(event) => setData('remember', event.target.checked)}
                        className="size-4 rounded-[3px] border border-line accent-brand"
                    />
                    Ingat saya di perangkat ini
                </label>

                <Button type="submit" loading={processing} className="w-full">
                    Masuk
                </Button>
            </form>

            {demo ? (
                <p className="mt-5 rounded-[4px] border border-line bg-canvas px-3 py-2.5 text-xs text-ink-soft">
                    Mode demo aktif. Masuk dengan{' '}
                    <span className="font-mono text-ink">{demo.username}</span> dan kata sandi{' '}
                    <span className="font-mono text-ink">{demo.password}</span>.
                </p>
            ) : null}

            <p className="mt-6 text-sm text-ink-soft">
                Belum punya akun?{' '}
                <Link href={routes.register()} className="font-medium text-brand underline underline-offset-4">
                    Daftar sebagai responden
                </Link>
            </p>
        </AuthLayout>
    );
}
