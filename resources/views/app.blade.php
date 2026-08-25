<!DOCTYPE html>
<html lang="id" class="bg-canvas">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title inertia>{{ config('app.name', 'Checklist Monitoring Maintenance') }}</title>

    @php
        $ringkasan = 'Pencatatan checklist maintenance dan infrastruktur area HCA, per week dan per line, lengkap dengan laporan Excel bulanan.';
        $pratinjau = url('/og-image.png');
    @endphp

    <meta name="description" content="{{ $ringkasan }}">
    <meta name="theme-color" content="#1F4E5F">

    {{-- Tampilan tautan saat dibagikan di WhatsApp, Telegram, Slack, dan sejenisnya. --}}
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{{ config('app.name') }}">
    <meta property="og:locale" content="id_ID">
    <meta property="og:title" content="{{ config('app.name') }}">
    <meta property="og:description" content="{{ $ringkasan }}">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:image" content="{{ $pratinjau }}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Checklist Monitoring Maintenance area HCA">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ config('app.name') }}">
    <meta name="twitter:description" content="{{ $ringkasan }}">
    <meta name="twitter:image" content="{{ $pratinjau }}">
    <meta name="color-scheme" content="light">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Checklist HCA">
    <meta name="application-name" content="Checklist HCA">

    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" href="/icons/icon-192.png" sizes="192x192">
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" sizes="180x180">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body class="bg-canvas text-ink font-sans antialiased">
    @inertia
</body>
</html>
