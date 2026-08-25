<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Domain\Activity\Services\ActivityLogger;
use App\Domain\Identity\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('auth/login');
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->ensureIsNotRateLimited();

        /** @var User|null $user */
        $user = User::query()
            ->where($request->credentialField(), $request->credentialValue())
            ->first();

        if ($user === null || ! Hash::check($request->string('password')->toString(), $user->password)) {
            $request->hitRateLimiter();

            throw ValidationException::withMessages([
                'login' => 'Nama pengguna, email, atau kata sandi salah.',
            ]);
        }

        if (! $user->is_active) {
            $request->hitRateLimiter();

            throw ValidationException::withMessages([
                'login' => 'Akun ini sedang dinonaktifkan. Hubungi admin.',
            ]);
        }

        $request->clearRateLimiter();

        Auth::login($user, $request->remember());
        $request->session()->regenerate();

        ActivityLogger::log('auth.login', 'Masuk ke aplikasi.', $user);

        return redirect()->intended(route('dashboard'))
            ->with('success', 'Selamat datang kembali, '.$user->name.'.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user instanceof User) {
            ActivityLogger::log('auth.logout', 'Keluar dari aplikasi.', $user);
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'Anda sudah keluar.');
    }
}
