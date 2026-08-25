<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Domain\Checklist\Models\ChecklistSubmission;
use App\Domain\Checklist\Support\ChecklistBlueprint;
use App\Domain\Identity\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $now = Carbon::now();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'submissions_total' => ChecklistSubmission::query()->count(),
                'submissions_month' => ChecklistSubmission::query()
                    ->where('period_year', $now->year)
                    ->where('period_month', $now->month)
                    ->count(),
                'users_total' => User::query()->count(),
                'responden_total' => User::query()
                    ->where('role', User::ROLE_RESPONDEN)
                    ->count(),
            ],
            'coverage' => $this->coverage((int) $now->year, (int) $now->month),
            'period' => [
                'year' => (int) $now->year,
                'month' => (int) $now->month,
                'label' => (ChecklistBlueprint::MONTHS[$now->month] ?? '').' '.$now->year,
            ],
            'recent' => ChecklistSubmission::query()
                ->with('user')
                ->latest('id')
                ->limit(5)
                ->get()
                ->map(static fn (ChecklistSubmission $s): array => $s->toSummary())
                ->all(),
        ]);
    }

    /**
     * Satu baris per kombinasi week dan line, 20 slot, urut seperti di sheet Excel.
     * Kalau satu slot diisi lebih dari sekali, yang ditampilkan adalah pengisi terbaru.
     *
     * @return list<array{week: int, line: int, filled: bool, author: string|null}>
     */
    private function coverage(int $year, int $month): array
    {
        $bySlot = [];

        $submissions = ChecklistSubmission::query()
            ->with('user')
            ->where('period_year', $year)
            ->where('period_month', $month)
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();

        foreach ($submissions as $submission) {
            $bySlot[$submission->week.'-'.$submission->line] = $submission->user?->name
                ?? $submission->nama_petugas;
        }

        $slots = [];

        foreach (ChecklistBlueprint::WEEKS as $week) {
            foreach (ChecklistBlueprint::LINES as $line) {
                $author = $bySlot[$week.'-'.$line] ?? null;

                $slots[] = [
                    'week' => $week,
                    'line' => $line,
                    'filled' => $author !== null,
                    'author' => $author,
                ];
            }
        }

        return $slots;
    }
}
