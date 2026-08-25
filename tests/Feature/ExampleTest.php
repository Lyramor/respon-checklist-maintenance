<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Identity\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\InteractsWithInertia;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use InteractsWithInertia, RefreshDatabase;

    public function test_root_sends_guests_to_the_login_page(): void
    {
        $this->get('/')->assertRedirect('/login');
    }

    public function test_root_sends_signed_in_users_to_the_dashboard(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/')->assertRedirect('/dashboard');
    }
}
