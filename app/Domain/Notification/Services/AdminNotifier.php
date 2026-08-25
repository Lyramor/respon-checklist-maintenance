<?php

declare(strict_types=1);

namespace App\Domain\Notification\Services;

use App\Domain\Checklist\Models\ChecklistSubmission;
use App\Domain\Identity\Models\User;
use App\Domain\Notification\Notifications\AdminAlert;
use App\Domain\Notification\Notifications\SubmissionSaved;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Notification as NotificationFacade;

/**
 * Mengirim notifikasi database ke seluruh akun admin yang aktif.
 */
final class AdminNotifier
{
    public static function submissionSaved(ChecklistSubmission $s): void
    {
        $admins = self::admins();

        if ($admins->isNotEmpty()) {
            NotificationFacade::send($admins, new SubmissionSaved($s));
        }
    }

    public static function userChanged(string $title, string $message): void
    {
        $admins = self::admins();

        if ($admins->isNotEmpty()) {
            NotificationFacade::send($admins, new AdminAlert($title, $message, '/admin/users'));
        }
    }

    /**
     * @return Collection<int, User>
     */
    private static function admins(): Collection
    {
        return User::query()
            ->where('role', User::ROLE_ADMIN)
            ->where('is_active', true)
            ->get();
    }
}
