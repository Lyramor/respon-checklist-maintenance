<?php

declare(strict_types=1);

namespace App\Domain\Checklist\Services;

use App\Domain\Activity\Services\ActivityLogger;
use App\Domain\Checklist\Models\ChecklistSubmission;
use App\Domain\Checklist\Support\ChecklistBlueprint;
use App\Domain\Identity\Models\User;
use App\Domain\Notification\Services\AdminNotifier;
use Illuminate\Support\Carbon;

/**
 * Menyimpan isian checklist beserta jejak aktivitas dan notifikasinya.
 */
final class ChecklistService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public static function store(array $data, User $actor): ChecklistSubmission
    {
        $date = Carbon::parse((string) $data['tanggal_pemeriksaan'])->startOfDay();

        /** @var array<string, mixed> $rawAnswers */
        $rawAnswers = is_array($data['answers'] ?? null) ? $data['answers'] : [];

        $submission = ChecklistSubmission::query()->create([
            'user_id' => $actor->getKey(),
            'nama_petugas' => trim((string) $data['nama_petugas']),
            'tanggal_pemeriksaan' => $date->toDateString(),
            'week' => (int) $data['week'],
            'line' => (int) $data['line'],
            'period_year' => (int) $date->year,
            'period_month' => (int) $date->month,
            'answers' => self::normalizeAnswers($rawAnswers),
        ]);

        $submission->setRelation('user', $actor);

        ActivityLogger::log(
            'checklist.created',
            sprintf(
                'Mengisi checklist Line %d Minggu %d untuk periode %s.',
                $submission->line,
                $submission->week,
                $submission->periodLabel(),
            ),
            $actor,
            $submission,
        );

        AdminNotifier::submissionSaved($submission);

        return $submission;
    }

    /**
     * Menyusun jawaban mengikuti urutan blueprint supaya isi kolom jsonb konsisten.
     *
     * @param  array<string, mixed>  $answers
     * @return array<string, string|null>
     */
    private static function normalizeAnswers(array $answers): array
    {
        $normalized = [];

        foreach (ChecklistBlueprint::items() as $item) {
            $value = $answers[$item['key']] ?? null;

            if (is_string($value)) {
                $value = trim($value);
            }

            $normalized[$item['key']] = ($value === null || $value === '') ? null : (string) $value;
        }

        return $normalized;
    }
}
