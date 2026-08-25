<?php

declare(strict_types=1);

namespace Tests\Feature\Concerns;

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Http\Request;
use Illuminate\Testing\TestResponse;

/**
 * Meminta respons dalam format Inertia (JSON) supaya pengujian backend
 * tidak bergantung pada blade root milik tim front end.
 */
trait InteractsWithInertia
{
    /**
     * Blade root memuat aset Vite, sedangkan pengujian backend berjalan tanpa
     * hasil build, jadi Vite dimatikan supaya respons non Inertia tetap ter-render.
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    protected function inertiaGet(string $uri): TestResponse
    {
        return $this->get($uri, $this->inertiaHeaders());
    }

    /**
     * @return array<string, string>
     */
    protected function inertiaHeaders(): array
    {
        $version = app(HandleInertiaRequests::class)->version(Request::create('/'));

        return [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => (string) $version,
        ];
    }
}
