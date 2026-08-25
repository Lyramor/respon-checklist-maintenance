<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Domain\Identity\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $feed = $user->notifications()->latest()->paginate(15)->withQueryString();

        $feed->getCollection()->transform(
            static fn (DatabaseNotification $notification): array => HandleInertiaRequests::presentNotification($notification)
        );

        // Nama prop sengaja "feed", bukan "notifications", supaya tidak menimpa
        // prop bersama yang dibaca lonceng notifikasi di layout.
        return Inertia::render('admin/notifications', [
            'feed' => $feed,
            'unread' => $user->unreadNotifications()->count(),
        ]);
    }

    public function markRead(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $user->unreadNotifications()->update(['read_at' => now()]);

        return back()->with('success', 'Semua notifikasi ditandai sudah dibaca.');
    }
}
