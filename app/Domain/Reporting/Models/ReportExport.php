<?php

declare(strict_types=1);

namespace App\Domain\Reporting\Models;

use App\Domain\Checklist\Support\ChecklistBlueprint;
use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Riwayat berkas laporan bulanan yang pernah dibuat admin.
 *
 * @property int $id
 * @property int|null $user_id
 * @property int $period_year
 * @property int $period_month
 * @property string $filename
 * @property string $path
 * @property int $size_bytes
 * @property int $submissions_count
 */
class ReportExport extends Model
{
    /** @var list<string> */
    protected $fillable = [
        'user_id',
        'period_year',
        'period_month',
        'filename',
        'path',
        'size_bytes',
        'submissions_count',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function label(): string
    {
        $month = ChecklistBlueprint::MONTHS[$this->period_month] ?? (string) $this->period_month;

        return $month.' '.$this->period_year;
    }

    public function sizeLabel(): string
    {
        $bytes = max(0, (int) $this->size_bytes);

        if ($bytes < 1024) {
            return $bytes.' B';
        }

        if ($bytes < 1048576) {
            return ((int) round($bytes / 1024)).' KB';
        }

        return round($bytes / 1048576, 1).' MB';
    }

    /**
     * Bentuk satu baris riwayat untuk front end.
     *
     * @return array<string, mixed>
     */
    public function toRow(): array
    {
        return [
            'id' => $this->id,
            'period_year' => (int) $this->period_year,
            'period_month' => (int) $this->period_month,
            'label' => $this->label(),
            'filename' => $this->filename,
            'size_label' => $this->sizeLabel(),
            'submissions_count' => (int) $this->submissions_count,
            'created_by' => $this->user?->name,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'period_year' => 'integer',
            'period_month' => 'integer',
            'size_bytes' => 'integer',
            'submissions_count' => 'integer',
        ];
    }
}
