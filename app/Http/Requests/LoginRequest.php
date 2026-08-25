<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    private const MAX_ATTEMPTS = 5;

    private const DECAY_SECONDS = 60;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'login' => ['required', 'string', 'max:190'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'login.required' => 'Nama pengguna atau email belum diisi.',
            'password.required' => 'Kata sandi belum diisi.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'login' => 'nama pengguna atau email',
            'password' => 'kata sandi',
        ];
    }

    public function credentialField(): string
    {
        return filter_var($this->string('login')->toString(), FILTER_VALIDATE_EMAIL) !== false
            ? 'email'
            : 'username';
    }

    public function credentialValue(): string
    {
        return strtolower(trim($this->string('login')->toString()));
    }

    public function remember(): bool
    {
        return $this->boolean('remember');
    }

    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->credentialValue()).'|'.$this->ip());
    }

    /**
     * Membatasi percobaan masuk supaya tidak bisa ditebak berulang kali.
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), self::MAX_ATTEMPTS)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'login' => 'Terlalu banyak percobaan masuk. Coba lagi dalam '.$seconds.' detik.',
        ]);
    }

    public function hitRateLimiter(): void
    {
        RateLimiter::hit($this->throttleKey(), self::DECAY_SECONDS);
    }

    public function clearRateLimiter(): void
    {
        RateLimiter::clear($this->throttleKey());
    }
}
