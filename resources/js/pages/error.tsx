import { Head, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { BrandMark } from '@/components/shell/brand-mark';
import { Credit } from '@/components/shell/credit';
import { routes } from '@/routes';

type Tone = 'brand' | 'warn' | 'bad';

interface ErrorCopy {
    tag: string;
    tone: Tone;
    title: string;
    body: string;
    primary: { label: string; href: string };
    secondary?: { label: string; href: string };
    reload?: boolean;
}

const copies: Record<number, ErrorCopy> = {
    404: {
        tag: 'Halaman tidak ditemukan',
        tone: 'brand',
        title: 'Halaman ini tidak ada',
        body: 'Alamat yang dibuka tidak terdaftar di aplikasi. Biasanya karena tautan lama, salah ketik, atau halaman yang sudah dipindah.',
        primary: { label: 'Kembali ke dashboard', href: routes.dashboard() },
        secondary: { label: 'Isi checklist', href: routes.checklist.create() },
    },
    403: {
        tag: 'Akses ditolak',
        tone: 'warn',
        title: 'Anda tidak punya akses ke halaman ini',
        body: 'Menu ini hanya untuk akun admin. Akun responden bisa mengisi checklist dan melihat riwayat isiannya sendiri lewat dashboard.',
        primary: { label: 'Kembali ke dashboard', href: routes.dashboard() },
        secondary: { label: 'Masuk dengan akun lain', href: routes.login() },
    },
    419: {
        tag: 'Sesi berakhir',
        tone: 'warn',
        title: 'Sesi Anda sudah berakhir',
        body: 'Halaman dibiarkan terbuka terlalu lama sehingga token keamanannya kedaluwarsa. Masuk sekali lagi, isian yang belum dikirim perlu diulang.',
        primary: { label: 'Masuk lagi', href: routes.login() },
    },
    500: {
        tag: 'Gangguan server',
        tone: 'bad',
        title: 'Ada gangguan di server',
        body: 'Permintaan tadi gagal diproses di sisi server. Catat dulu isian yang belum tersimpan, lalu coba lagi. Kalau masih sama, kabari admin dengan waktu kejadiannya.',
        primary: { label: 'Coba lagi', href: routes.dashboard() },
        reload: true,
    },
    503: {
        tag: 'Sedang perawatan',
        tone: 'warn',
        title: 'Aplikasi sedang dirawat sebentar',
        body: 'Ada pembaruan yang sedang dipasang. Pengisian checklist bisa dilanjutkan beberapa menit lagi.',
        primary: { label: 'Muat ulang halaman', href: routes.dashboard() },
        reload: true,
    },
};

const fallback: ErrorCopy = {
    tag: 'Permintaan gagal',
    tone: 'bad',
    title: 'Permintaan tidak bisa diproses',
    body: 'Aplikasi menolak permintaan tadi. Kembali ke dashboard lalu ulangi langkah terakhir Anda.',
    primary: { label: 'Kembali ke dashboard', href: routes.dashboard() },
};

export default function ErrorPage({ status }: { status: number }) {
    const copy = copies[status] ?? fallback;

    return (
        <>
            <Head title={copy.title} />

            <div className="flex min-h-dvh flex-col bg-canvas">
                <header className="border-b border-line bg-surface">
                    <Container size="narrow">
                        <div className="flex items-center gap-2.5 py-3.5">
                            <BrandMark className="size-8" />
                            <p className="font-display text-[14px] font-semibold text-ink">
                                Checklist HCA
                            </p>
                        </div>
                    </Container>
                </header>

                <Section pad="lg" className="flex flex-1 items-center">
                    <Container size="narrow">
                        <Card>
                            <div className="flex items-center gap-3 border-b border-line px-5 py-3">
                                <span
                                    data-numeric
                                    className="text-[13px] font-semibold tracking-[0.08em] text-ink-soft"
                                >
                                    STATUS {status}
                                </span>
                                <Badge tone={copy.tone}>{copy.tag}</Badge>
                            </div>
                            <CardBody className="py-6">
                                <h1 className="font-display text-[clamp(22px,3vw,28px)] leading-tight font-semibold text-ink">
                                    {copy.title}
                                </h1>
                                <p className="mt-2.5 max-w-[58ch] text-[13.5px] leading-relaxed text-ink-soft">
                                    {copy.body}
                                </p>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    <Button
                                        onClick={() =>
                                            copy.reload
                                                ? window.location.reload()
                                                : router.visit(copy.primary.href)
                                        }
                                    >
                                        {copy.primary.label}
                                    </Button>
                                    {copy.secondary ? (
                                        <Button
                                            variant="secondary"
                                            onClick={() => router.visit(copy.secondary!.href)}
                                        >
                                            {copy.secondary.label}
                                        </Button>
                                    ) : null}
                                </div>
                            </CardBody>
                        </Card>

                        <p className="mt-4 text-[12px] leading-relaxed text-ink-soft">
                            Kalau halaman ini muncul berulang saat mengisi checklist, kirim tangkapan
                            layar beserta jam kejadian ke admin agar bisa ditelusuri di log aktivitas.
                        </p>

                        <Credit className="mt-6" />
                    </Container>
                </Section>
            </div>
        </>
    );
}
