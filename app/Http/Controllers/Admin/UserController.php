<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Domain\Identity\Models\User;
use App\Domain\Identity\Services\UserService;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->withCount('submissions')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $users->getCollection()->transform(static fn (User $user): array => [
            'id' => $user->getKey(),
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role,
            'is_active' => (bool) $user->is_active,
            'submissions_count' => (int) ($user->submissions_count ?? 0),
            'created_at' => $user->created_at?->toIso8601String(),
        ]);

        return Inertia::render('admin/users', [
            'users' => $users,
            'roles' => [
                ['value' => User::ROLE_ADMIN, 'label' => 'Admin'],
                ['value' => User::ROLE_RESPONDEN, 'label' => 'Responden'],
            ],
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        /** @var User $actor */
        $actor = $request->user();

        $user = UserService::create($request->validated(), $actor);

        return redirect()->route('admin.users.index')
            ->with('success', 'Akun '.$user->username.' berhasil dibuat.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        /** @var User $actor */
        $actor = $request->user();

        try {
            UserService::delete($user, $actor);
        } catch (RuntimeException $exception) {
            return redirect()->route('admin.users.index')
                ->with('error', $exception->getMessage());
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'Akun berhasil dihapus.');
    }
}
