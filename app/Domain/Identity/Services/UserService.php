<?php

declare(strict_types=1);

namespace App\Domain\Identity\Services;

use App\Domain\Activity\Services\ActivityLogger;
use App\Domain\Identity\Models\User;
use App\Domain\Notification\Services\AdminNotifier;
use RuntimeException;

/**
 * Pengelolaan akun oleh admin.
 */
final class UserService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public static function create(array $data, User $actor): User
    {
        $role = ($data['role'] ?? User::ROLE_RESPONDEN) === User::ROLE_ADMIN
            ? User::ROLE_ADMIN
            : User::ROLE_RESPONDEN;

        $user = User::query()->create([
            'name' => trim((string) $data['name']),
            'username' => strtolower(trim((string) $data['username'])),
            'email' => strtolower(trim((string) $data['email'])),
            'password' => (string) $data['password'],
            'role' => $role,
            'is_active' => true,
        ]);

        ActivityLogger::log(
            'user.created',
            sprintf('Membuat akun %s (%s) dengan peran %s.', $user->name, $user->username, $user->role),
            $actor,
            $user,
        );

        AdminNotifier::userChanged(
            'Akun baru dibuat',
            sprintf('%s membuat akun %s dengan peran %s.', $actor->name, $user->username, $user->role),
        );

        return $user;
    }

    public static function delete(User $target, User $actor): void
    {
        if ($target->isAdmin() && self::adminCount() <= 1) {
            throw new RuntimeException('Admin terakhir tidak dapat dihapus. Buat admin lain terlebih dahulu.');
        }

        if ((int) $target->getKey() === (int) $actor->getKey()) {
            throw new RuntimeException('Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $name = $target->name;
        $username = $target->username;

        $target->delete();

        ActivityLogger::log(
            'user.deleted',
            sprintf('Menghapus akun %s (%s).', $name, $username),
            $actor,
        );

        AdminNotifier::userChanged(
            'Akun dihapus',
            sprintf('%s menghapus akun %s.', $actor->name, $username),
        );
    }

    private static function adminCount(): int
    {
        return User::query()->where('role', User::ROLE_ADMIN)->count();
    }
}
