import '../css/app.css';

import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import type { SharedProps } from '@/types';

type PageModule = { default: ResolvedComponent };

const fallbackName = 'Checklist Monitoring Maintenance';

createInertiaApp<SharedProps>({
    title: (title, page) => {
        const name = (page.props as unknown as SharedProps)?.app?.name ?? fallbackName;

        return title ? `${title} \u00b7 ${name}` : name;
    },
    resolve: (name: string) =>
        resolvePageComponent<PageModule>(
            `./pages/${name}.tsx`,
            import.meta.glob<PageModule>('./pages/**/*.tsx'),
        ).then((module) => module.default),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#1F4E5F',
        delay: 120,
        showSpinner: false,
    },
});

// Offline shell. The worker itself never stores authenticated HTML, see vite.config.js.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
            // A blocked worker must never take the app down with it.
        });
    });
}
