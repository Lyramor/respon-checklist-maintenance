<?php

declare(strict_types=1);

namespace App\Domain\Activity\Services;

use App\Domain\Activity\Models\ActivityLog;
use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

/**
 * Pencatat jejak aktivitas pengguna.
 */
final class ActivityLogger
{
    public static function log(string $action, string $description, ?User $actor = null, ?Model $subject = null): void
    {
        $actor ??= self::currentUser();

        ActivityLog::query()->create([
            'user_id' => $actor?->getKey(),
            'actor_name' => $actor?->name ?? 'Sistem',
            'action' => $action,
            'description' => $description,
            'subject_type' => $subject !== null ? $subject::class : null,
            'subject_id' => $subject !== null ? (int) $subject->getKey() : null,
            'ip_address' => Request::ip(),
        ]);
    }

    private static function currentUser(): ?User
    {
        $user = Auth::user();

        return $user instanceof User ? $user : null;
    }
}
