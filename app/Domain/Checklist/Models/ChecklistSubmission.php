<?php

declare(strict_types=1);

namespace App\Domain\Checklist\Models;

use App\Domain\Checklist\Support\ChecklistBlueprint;
use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string $nama_petugas
 * @property Carbon|null $tanggal_pemeriksaan
 * @property int $week
 * @property int $line
 * @property int $period_year
 * @property int $period_month
 * @property array<string, string|null> $answers
 */
class ChecklistSubmission extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'nama_petugas',
        'tanggal_pemeriksaan',
        'week',
        'line',
        'period_year',
        'period_month',
        'answers',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Jumlah jawaban per tingkat keparahan, dipakai kartu ringkasan dan tabel admin.
     *
     * @return array{ok: int, warn: int, bad: int}
     */
    public function severityCounts(): array
    {
        $counts = ['ok' => 0, 'warn' => 0, 'bad' => 0];
        $answers = $this->answers ?? [];

        foreach (ChecklistBlueprint::optionKeys() as $key) {
            $severity = ChecklistBlueprint::severityFor($key, $answers[$key] ?? null);

            if ($severity !== null && array_key_exists($severity, $counts)) {
                $counts[$severity]++;
            }
        }

        return $counts;
    }

    public function periodLabel(): string
    {
        $month = ChecklistBlueprint::MONTHS[$this->period_month] ?? (string) $this->period_month;

        return $month.' '.$this->period_year;
    }

    /**
     * Bentuk data ringkas untuk front end (SubmissionSummary).
     *
     * @return array<string, mixed>
     */
    public function toSummary(): array
    {
        return [
            'id' => $this->id,
            'nama_petugas' => $this->nama_petugas,
            'tanggal_pemeriksaan' => $this->tanggal_pemeriksaan?->toDateString(),
            'week' => (int) $this->week,
            'line' => (int) $this->line,
            'period_year' => (int) $this->period_year,
            'period_month' => (int) $this->period_month,
            'period_label' => $this->periodLabel(),
            'author' => $this->user?->name,
            'counts' => $this->severityCounts(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }

    /**
     * Bentuk data lengkap untuk halaman detail (SubmissionDetail).
     *
     * @return array<string, mixed>
     */
    public function toDetail(): array
    {
        $answers = [];

        foreach (ChecklistBlueprint::items() as $item) {
            $answers[$item['key']] = $this->answers[$item['key']] ?? null;
        }

        return $this->toSummary() + ['answers' => $answers];
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'tanggal_pemeriksaan' => 'date',
            'week' => 'integer',
            'line' => 'integer',
            'period_year' => 'integer',
            'period_month' => 'integer',
        ];
    }
}
