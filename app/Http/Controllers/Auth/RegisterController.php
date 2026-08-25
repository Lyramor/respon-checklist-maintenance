<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Domain\Activity\Services\ActivityLogger;
use App\Domain\Identity\Models\User;
use App\Domain\Notification\Services\AdminNotifier;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Pendaftaran mandiri selalu menghasilkan akun responden.
     */
    public function store(RegisterRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $user = User::query()->create([
            'name' => trim((string) $data['name']),
            'username' => (string) $data['username'],
            'email' => (string) $data['email'],
            'password' => (string) $data['password'],
            'role' => User::ROLE_RESPONDEN,
            'is_active' => true,
        ]);

        ActivityLogger::log(
            'user.registered',
            sprintf('Mendaftar akun responden %s.', $user->username),
            $user,
            $user,
        );

        AdminNotifier::userChanged(
            'Pendaftaran akun baru',
            sprintf('%s mendaftar sebagai responden.', $user->name),
        );

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard')
            ->with('success', 'Akun berhasil dibuat. Selamat datang, '.$user->name.'.');
    }
}
