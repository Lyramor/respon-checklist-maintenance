import { copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * Paths the service worker must never intercept:
 * the xlsx download stream and every route that is only reached with a non-GET verb.
 * A form post is a navigation request too, so it has to be excluded explicitly.
 */
const swBypass = [
    /^\/admin\/reports\/.*\/download$/,
    /^\/admin\/reports\/\d+$/,
    /^\/logout$/,
    /^\/login$/,
    /^\/register$/,
    /^\/checklist$/,
    /^\/admin\/users/,
    /^\/admin\/notifications\/read$/,
    /^\/build\//,
    /^\/storage\//,
];

const isBypassed = (url) => swBypass.some((pattern) => pattern.test(url.pathname));

/**
 * vite-plugin-pwa writes sw.js straight into public/, but the web app manifest goes out
 * through Rollup's asset pipeline, so it lands in public/build/ instead. The blade root
 * links /manifest.webmanifest, so without this copy the manifest 404s and the app is not
 * installable. Copying after the bundle keeps a single generated source of truth.
 */
const manifestKePublicRoot = () => ({
    name: 'salin-manifest-ke-public-root',
    apply: 'build',
    closeBundle() {
        const dari = fileURLToPath(new URL('./public/build/manifest.webmanifest', import.meta.url));
        const ke = fileURLToPath(new URL('./public/manifest.webmanifest', import.meta.url));

        if (existsSync(dari)) {
            copyFileSync(dari, ke);
        }
    },
});

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('IBM Plex Sans', { weights: [400, 500, 600] }),
                bunny('IBM Plex Sans Condensed', { weights: [500, 600] }),
                bunny('IBM Plex Mono', { weights: [400, 500] }),
            ],
        }),
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: false,
            // Laravel builds into public/build but the app is served from public/.
            outDir: 'public',
            base: '/',
            buildBase: '/',
            scope: '/',
            filename: 'sw.js',
            manifestFilename: 'manifest.webmanifest',
            includeAssets: ['favicon.ico', 'icons/apple-touch-icon.png'],
            manifest: {
                lang: 'id',
                dir: 'ltr',
                name: 'Checklist Monitoring Maintenance',
                short_name: 'Checklist HCA',
                description:
                    'Pencatatan checklist monitoring maintenance area HCA per minggu dan per line.',
                theme_color: '#1F4E5F',
                background_color: '#F1F4F4',
                display: 'standalone',
                orientation: 'portrait-primary',
                start_url: '/dashboard',
                scope: '/',
                categories: ['productivity', 'utilities'],
                icons: [
                    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
                    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
                    { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
            workbox: {
                globDirectory: 'public',
                globPatterns: [
                    'offline.html',
                    'favicon.ico',
                    'icons/*.png',
                    'build/assets/**/*.{js,css,woff2,woff}',
                ],
                cleanupOutdatedCaches: true,
                clientsClaim: true,
                skipWaiting: true,
                // No navigateFallback: this app is server rendered, so an app shell would
                // shadow real pages. The denylist stays declared for the same paths the
                // runtime navigation route skips.
                navigateFallbackDenylist: swBypass,
                runtimeCaching: [
                    {
                        // Authenticated HTML is never stored. Offline we show a written page
                        // instead of a stale dashboard.
                        urlPattern: ({ request, url }) =>
                            request.mode === 'navigate' &&
                            request.method === 'GET' &&
                            !isBypassed(url),
                        handler: 'NetworkOnly',
                        options: {
                            precacheFallback: { fallbackURL: '/offline.html' },
                        },
                    },
                    {
                        urlPattern: ({ request }) =>
                            request.destination === 'script' || request.destination === 'style',
                        handler: 'StaleWhileRevalidate',
                        options: { cacheName: 'aset-app' },
                    },
                    {
                        urlPattern: ({ request }) => request.destination === 'font',
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'font-app',
                            expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 365 },
                        },
                    },
                    {
                        urlPattern: ({ request }) => request.destination === 'image',
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'gambar-app',
                            expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 },
                        },
                    },
                ],
            },
            devOptions: { enabled: false },
        }),
        manifestKePublicRoot(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
        },
    },
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
