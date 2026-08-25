<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Checklist\Models\ChecklistSubmission;
use App\Domain\Checklist\Support\ChecklistBlueprint;
use App\Domain\Identity\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        return Inertia::render('dashboard', [
            'role' => $user->role,
            'mine' => $this->mine($user),
            'admin' => $user->isAdmin() ? $this->admin() : null,
        ]);
    }

    /**
     * Angka milik pengguna sendiri. Selalu dikirim, termasuk untuk admin,
     * karena admin juga mengisi checklist.
     *
     * @return array<string, mixed>
     */
    private function mine(User $user): array
    {
        $now = Carbon::now();

        $recent = ChecklistSubmission::query()
            ->with('user')
            ->where('user_id', $user->getKey())
            ->latest('id')
            ->limit(10)
            ->get();

        return [
            'total' => ChecklistSubmission::query()
                ->where('user_id', $user->getKey())
                ->count(),
            'this_month' => ChecklistSubmission::query()
                ->where('user_id', $user->getKey())
                ->where('period_year', $now->year)
                ->where('period_month', $now->month)
                ->count(),
            'last' => $recent->first()?->toSummary(),
            'recent' => $recent->map(
                static fn (ChecklistSubmission $s): array => $s->toSummary()
            )->all(),
        ];
    }

    /**
     * Ringkasan operasional, hanya untuk admin.
     *
     * @return array<string, mixed>
     */
    private function admin(): array
    {
        $now = Carbon::now();

        $filledSlots = ChecklistSubmission::query()
            ->where('period_year', $now->year)
            ->where('period_month', $now->month)
            ->get(['week', 'line'])
            ->map(static fn (ChecklistSubmission $s): string => $s->week.'-'.$s->line)
            ->unique();

        $recent = ChecklistSubmission::query()
            ->with('user')
            ->latest('id')
            ->limit(5)
            ->get();

        return [
            'submissions_total' => ChecklistSubmission::query()->count(),
            'submissions_month' => ChecklistSubmission::query()
                ->where('period_year', $now->year)
                ->where('period_month', $now->month)
                ->count(),
            'users_total' => User::query()->count(),
            'coverage_filled' => $filledSlots->count(),
            'coverage_total' => count(ChecklistBlueprint::WEEKS) * count(ChecklistBlueprint::LINES),
            'period' => [
                'year' => (int) $now->year,
                'month' => (int) $now->month,
                'label' => (ChecklistBlueprint::MONTHS[$now->month] ?? '').' '.$now->year,
            ],
            'recent' => $recent->map(
                static fn (ChecklistSubmission $s): array => $s->toSummary()
            )->all(),
        ];
    }
}
