<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Domain\Identity\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user instanceof User && $user->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'username' => ['required', 'string', 'alpha_dash', 'min:3', 'max:30', Rule::unique('users', 'username')],
            'email' => ['required', 'string', 'email', 'max:190', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in([User::ROLE_ADMIN, User::ROLE_RESPONDEN])],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap belum diisi.',
            'name.max' => 'Nama lengkap maksimal 120 karakter.',
            'username.required' => 'Nama pengguna belum diisi.',
            'username.alpha_dash' => 'Nama pengguna hanya boleh huruf, angka, strip, dan garis bawah.',
            'username.min' => 'Nama pengguna minimal 3 karakter.',
            'username.max' => 'Nama pengguna maksimal 30 karakter.',
            'username.unique' => 'Nama pengguna sudah dipakai akun lain.',
            'email.required' => 'Email belum diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah dipakai akun lain.',
            'password.required' => 'Kata sandi belum diisi.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak sama.',
            'role.required' => 'Peran akun belum dipilih.',
            'role.in' => 'Peran akun tidak valid.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama lengkap',
            'username' => 'nama pengguna',
            'email' => 'email',
            'password' => 'kata sandi',
            'role' => 'peran akun',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'username' => is_string($this->input('username')) ? strtolower(trim($this->input('username'))) : $this->input('username'),
            'email' => is_string($this->input('email')) ? strtolower(trim($this->input('email'))) : $this->input('email'),
        ]);
    }
}
