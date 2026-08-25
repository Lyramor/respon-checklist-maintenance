<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Identity\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\InteractsWithInertia;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use InteractsWithInertia, RefreshDatabase;

    public function test_admin_can_create_an_account(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/admin/users', [
            'name' => 'Rina Kusuma',
            'username' => 'rina',
            'email' => 'rina@example.test',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
            'role' => User::ROLE_RESPONDEN,
        ])->assertRedirect('/admin/users')->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'username' => 'rina',
            'email' => 'rina@example.test',
            'role' => User::ROLE_RESPONDEN,
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $admin->id,
            'action' => 'user.created',
        ]);

        $created = User::query()->where('username', 'rina')->firstOrFail();
        $this->assertNotSame('rahasia123', $created->password);
    }

    public function test_creating_an_account_validates_the_input(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/admin/users', [
            'name' => '',
            'username' => 'a',
            'email' => 'bukan-email',
            'password' => 'pendek',
            'password_confirmation' => 'beda',
            'role' => 'superadmin',
        ])->assertSessionHasErrors(['name', 'username', 'email', 'password', 'role']);
    }

    public function test_responden_cannot_manage_accounts(): void
    {
        $responden = User::factory()->create();
        $target = User::factory()->create();

        $this->actingAs($responden)->post('/admin/users', [])->assertForbidden();
        $this->actingAs($responden)->delete('/admin/users/'.$target->id)->assertForbidden();
    }

    public function test_admin_can_delete_another_account(): void
    {
        $admin = User::factory()->admin()->create();
        $target = User::factory()->create(['username' => 'dihapus']);

        $this->actingAs($admin)->delete('/admin/users/'.$target->id)
            ->assertRedirect('/admin/users')
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('users', ['id' => $target->id]);
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $admin->id,
            'action' => 'user.deleted',
        ]);
    }

    public function test_the_last_admin_cannot_be_deleted(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->delete('/admin/users/'.$admin->id)
            ->assertRedirect('/admin/users')
            ->assertSessionHas('error', 'Admin terakhir tidak dapat dihapus. Buat admin lain terlebih dahulu.');

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_admin_cannot_delete_their_own_account(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->admin()->create();

        $this->actingAs($admin)->delete('/admin/users/'.$admin->id)
            ->assertRedirect('/admin/users')
            ->assertSessionHas('error', 'Anda tidak dapat menghapus akun Anda sendiri.');

        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_admin_user_list_is_paginated(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->count(20)->create();

        $this->actingAs($admin)->inertiaGet('/admin/users')
            ->assertOk()
            ->assertJsonPath('component', 'admin/users')
            ->assertJsonPath('props.users.per_page', 15)
            ->assertJsonPath('props.users.total', 21);
    }
}
