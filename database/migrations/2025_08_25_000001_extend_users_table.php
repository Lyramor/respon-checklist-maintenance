<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kolom email sudah wajib dan unik sejak migrasi bawaan Laravel,
     * jadi migrasi ini hanya menambah kolom identitas dan status akun.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('username', 60)->nullable()->after('name');
            $table->string('role', 20)->default('responden')->after('email');
            $table->boolean('is_active')->default(true)->after('role');
        });

        foreach (DB::table('users')->whereNull('username')->pluck('id') as $id) {
            DB::table('users')->where('id', $id)->update(['username' => 'user'.$id]);
        }

        Schema::table('users', function (Blueprint $table): void {
            $table->string('username', 60)->nullable(false)->change();
            $table->unique('username');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique(['username']);
            $table->dropColumn(['username', 'role', 'is_active']);
        });
    }
};
