<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Identity\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\InteractsWithInertia;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use InteractsWithInertia, RefreshDatabase;

    public function test_login_page_renders_the_inertia_component(): void
    {
        $this->inertiaGet('/login')
            ->assertOk()
            ->assertJsonPath('component', 'auth/login');
    }

    public function test_user_can_login_with_username(): void
    {
        $user = User::factory()->create([
            'username' => 'petugas1',
            'email' => 'petugas1@example.test',
        ]);

        $response = $this->post('/login', [
            'login' => 'petugas1',
            'password' => 'password',
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'action' => 'auth.login',
        ]);
    }

    public function test_user_can_login_with_email(): void
    {
        $user = User::factory()->create([
            'username' => 'petugas2',
            'email' => 'petugas2@example.test',
        ]);

        $this->post('/login', [
            'login' => 'petugas2@example.test',
            'password' => 'password',
        ])->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs($user);
    }

    public function test_login_fails_with_a_wrong_password(): void
    {
        User::factory()->create(['username' => 'petugas3']);

        $this->post('/login', [
            'login' => 'petugas3',
            'password' => 'salah-sekali',
        ])->assertSessionHasErrors('login');

        $this->assertGuest();
    }

    public function test_inactive_account_cannot_login(): void
    {
        User::factory()->inactive()->create(['username' => 'nonaktif']);

        $this->post('/login', [
            'login' => 'nonaktif',
            'password' => 'password',
        ])->assertSessionHasErrors('login');

        $this->assertGuest();
    }

    public function test_registration_always_creates_a_responden(): void
    {
        $this->post('/register', [
            'name' => 'Budi Santoso',
            'username' => 'budi',
            'email' => 'budi@example.test',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
        ])->assertRedirect('/dashboard');

        $this->assertDatabaseHas('users', [
            'username' => 'budi',
            'role' => User::ROLE_RESPONDEN,
        ]);
    }

    public function test_logout_is_recorded_in_the_activity_log(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/logout')->assertRedirect('/login');

        $this->assertGuest();
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'action' => 'auth.logout',
        ]);
    }
}
