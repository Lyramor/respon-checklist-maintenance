import { useEffect, useState, type ReactNode } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Container } from '@/components/ui/container';
import { Credit } from '@/components/shell/credit';
import { FlashMessages } from '@/components/shell/flash-messages';
import { Sidebar } from '@/components/shell/sidebar';
import { Topbar } from '@/components/shell/topbar';
import type { SharedProps } from '@/types';

interface AppLayoutProps {
    title: string;
    children: ReactNode;
    size?: 'default' | 'wide';
}

export default function AppLayout({ title, children, size = 'default' }: AppLayoutProps) {
    const page = usePage<SharedProps>();
    const [menuOpen, setMenuOpen] = useState(false);

    // A slide-over that survives a page change would cover the page it opened.
    useEffect(() => {
        setMenuOpen(false);
    }, [page.url]);

    return (
        <>
            <Head title={title} />

            <div className="min-h-dvh bg-canvas lg:pl-sidebar">
                <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

                <div className="flex min-h-dvh flex-col">
                    <Topbar title={title} onMenu={() => setMenuOpen(true)} />

                    {/* Pages bring their own Section and Container, so the shell must not add a
                        second set or every gutter and every vertical rhythm doubles up. */}
                    <main className="flex-1">
                        <FlashMessages size={size} />
                        {children}
                    </main>

                    <footer className="border-t border-line bg-surface">
                        <Container size={size}>
                            <div className="flex flex-wrap items-center justify-between gap-2 py-4">
                                <p className="text-[12px] text-ink-soft">
                                    Checklist Monitoring Maintenance, area HCA.
                                </p>
                                <Credit />
                            </div>
                        </Container>
                    </footer>
                </div>
            </div>
        </>
    );
}
