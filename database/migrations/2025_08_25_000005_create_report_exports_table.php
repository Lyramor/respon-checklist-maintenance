<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('report_exports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->smallInteger('period_year');
            $table->smallInteger('period_month');
            $table->string('filename');
            $table->string('path');
            $table->bigInteger('size_bytes')->default(0);
            $table->integer('submissions_count')->default(0);
            $table->timestamps();

            $table->index(['period_year', 'period_month'], 'report_exports_period_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_exports');
    }
};
