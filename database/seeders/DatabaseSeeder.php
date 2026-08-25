<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\Identity\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seeder aman dijalankan berulang kali.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Administrator',
                'email' => 'admin@krevostudio.com',
                'password' => 'password',
                'role' => User::ROLE_ADMIN,
                'is_active' => true,
            ],
        );

        User::query()->updateOrCreate(
            ['username' => 'responden'],
            [
                'name' => 'Responden Demo',
                'email' => 'responden@krevostudio.com',
                'password' => 'password',
                'role' => User::ROLE_RESPONDEN,
                'is_active' => true,
            ],
        );

        $this->call(RespondenChecklistSeeder::class);
    }
}
