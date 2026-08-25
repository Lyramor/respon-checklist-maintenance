<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Domain\Identity\Models\User;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * Blade root yang memuat aplikasi React.
     *
     * @var string
     */
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $user = $user instanceof User ? $user : null;

        return array_merge(parent::share($request), [
            'app' => [
                'name' => config('app.name'),
            ],
            'auth' => [
                'user' => $user?->toAuthPayload(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'notifications' => $this->notificationsFor($user),
        ]);
    }

    /**
     * Notifikasi hanya relevan untuk admin.
     *
     * @return array{unread: int, items: list<array<string, mixed>>}
     */
    protected function notificationsFor(?User $user): array
    {
        if ($user === null || ! $user->isAdmin()) {
            return ['unread' => 0, 'items' => []];
        }

        $items = $user->notifications()->latest()->limit(8)->get()
            ->map(static fn (DatabaseNotification $notification): array => self::presentNotification($notification))
            ->values()
            ->all();

        return [
            'unread' => $user->unreadNotifications()->count(),
            'items' => $items,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function presentNotification(DatabaseNotification $notification): array
    {
        /** @var array<string, mixed> $data */
        $data = $notification->data ?? [];

        return [
            'id' => (string) $notification->getKey(),
            'title' => (string) ($data['title'] ?? 'Notifikasi'),
            'message' => (string) ($data['message'] ?? ''),
            'url' => isset($data['url']) ? (string) $data['url'] : null,
            'read' => $notification->read_at !== null,
            'created_at' => $notification->created_at?->toIso8601String(),
        ];
    }
}
