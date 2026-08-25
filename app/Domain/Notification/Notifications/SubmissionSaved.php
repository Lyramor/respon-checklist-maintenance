<?php

declare(strict_types=1);

namespace App\Domain\Notification\Notifications;

use App\Domain\Checklist\Models\ChecklistSubmission;
use Illuminate\Notifications\Notification;

/**
 * Notifikasi ke seluruh admin setiap ada checklist masuk.
 */
final class SubmissionSaved extends Notification
{
    public function __construct(private readonly ChecklistSubmission $submission) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Checklist baru masuk',
            'message' => sprintf(
                '%s mengisi checklist Line %d Minggu %d untuk periode %s.',
                $this->submission->nama_petugas,
                $this->submission->line,
                $this->submission->week,
                $this->submission->periodLabel(),
            ),
            'url' => '/admin/submissions/'.$this->submission->getKey(),
        ];
    }
}
