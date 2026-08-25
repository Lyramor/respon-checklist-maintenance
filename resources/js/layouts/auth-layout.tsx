import type { ReactNode } from 'react';
import { Head } from '@inertiajs/react';
import { Container } from '@/components/ui/container';
import { AuthBrandPanel } from '@/components/shell/auth-brand-panel';
import { BrandMark } from '@/components/shell/brand-mark';
import { Credit } from '@/components/shell/credit';

interface AuthLayoutProps {
    title: string;
    subtitle: string;
    children: ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
    return (
        <>
            <Head title={title} />

            <div className="grid min-h-dvh grid-cols-1 bg-canvas lg:grid-cols-[1fr_minmax(440px,42%)]">
                <div className="hidden lg:block">
                    <AuthBrandPanel />
                </div>

                <div className="flex min-h-dvh flex-col bg-surface lg:min-h-0">
                    <div className="flex items-center gap-2.5 border-b border-line px-[clamp(16px,4vw,40px)] py-3.5 lg:hidden">
                        <BrandMark className="size-8" />
                        <div>
                            <p className="font-display text-[14px] leading-tight font-semibold text-ink">
                                Checklist HCA
                            </p>
                            <p className="text-[11px] text-ink-soft">Monitoring Maintenance</p>
                        </div>
                    </div>

                    <Container
                        size="narrow"
                        className="flex flex-1 flex-col justify-center py-[clamp(32px,7vh,72px)]"
                    >
                        <h1 className="font-display text-[clamp(24px,3.2vw,30px)] leading-tight font-semibold text-ink">
                            {title}
                        </h1>
                        <p className="mt-2 max-w-[46ch] text-[13.5px] leading-relaxed text-ink-soft">
                            {subtitle}
                        </p>

                        <div className="mt-7">{children}</div>
                    </Container>

                    <Container size="narrow" className="border-t border-line py-4">
                        <Credit />
                    </Container>
                </div>
            </div>
        </>
    );
}
