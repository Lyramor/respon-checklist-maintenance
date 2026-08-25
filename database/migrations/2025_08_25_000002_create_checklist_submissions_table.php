<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('checklist_submissions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nama_petugas', 120);
            $table->date('tanggal_pemeriksaan');
            $table->smallInteger('week');
            $table->smallInteger('line');
            $table->smallInteger('period_year');
            $table->smallInteger('period_month');
            $table->jsonb('answers');
            $table->timestamps();

            $table->index(['period_year', 'period_month', 'week', 'line'], 'checklist_submissions_period_index');
            $table->index('user_id', 'checklist_submissions_user_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('checklist_submissions');
    }
};
