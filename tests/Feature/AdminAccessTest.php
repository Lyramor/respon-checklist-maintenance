<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Identity\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\InteractsWithInertia;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use InteractsWithInertia, RefreshDatabase;

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/admin')->assertRedirect('/login');
    }

    public function test_responden_cannot_open_the_admin_area(): void
    {
        $responden = User::factory()->create();

        $this->actingAs($responden)->inertiaGet('/admin')->assertForbidden();
        $this->actingAs($responden)->inertiaGet('/admin/submissions')->assertForbidden();
        $this->actingAs($responden)->inertiaGet('/admin/users')->assertForbidden();
        $this->actingAs($responden)->inertiaGet('/admin/activity')->assertForbidden();
    }

    public function test_admin_can_open_the_admin_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->inertiaGet('/admin')
            ->assertOk()
            ->assertJsonPath('component', 'admin/dashboard');
    }

    public function test_responden_dashboard_only_lists_their_own_submissions(): void
    {
        $responden = User::factory()->create();

        $this->actingAs($responden)->inertiaGet('/dashboard')
            ->assertOk()
            ->assertJsonPath('component', 'dashboard')
            ->assertJsonPath('props.role', User::ROLE_RESPONDEN)
            ->assertJsonPath('props.coverage', null);
    }
}
