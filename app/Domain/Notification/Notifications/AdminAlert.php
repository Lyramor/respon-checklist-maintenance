<?php

declare(strict_types=1);

namespace App\Domain\Notification\Notifications;

use Illuminate\Notifications\Notification;

/**
 * Notifikasi umum untuk admin (buat akun, hapus akun, dan sejenisnya).
 */
final class AdminAlert extends Notification
{
    public function __construct(
        private readonly string $title,
        private readonly string $message,
        private readonly ?string $url = null,
    ) {}

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
            'title' => $this->title,
            'message' => $this->message,
            'url' => $this->url,
        ];
    }
}
