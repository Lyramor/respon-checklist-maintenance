<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Domain\Checklist\Models\ChecklistSubmission;
use App\Domain\Checklist\Support\ChecklistBlueprint;
use App\Http\Controllers\ChecklistController;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class SubmissionController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'year' => $this->intOrNull($request->input('year')),
            'month' => $this->intOrNull($request->input('month')),
            'week' => $this->intOrNull($request->input('week')),
            'line' => $this->intOrNull($request->input('line')),
            'q' => is_string($request->input('q')) ? trim($request->input('q')) : '',
        ];

        $query = ChecklistSubmission::query()->with('user')->latest('id');

        if ($filters['year'] !== null) {
            $query->where('period_year', $filters['year']);
        }

        if ($filters['month'] !== null) {
            $query->where('period_month', $filters['month']);
        }

        if ($filters['week'] !== null) {
            $query->where('week', $filters['week']);
        }

        if ($filters['line'] !== null) {
            $query->where('line', $filters['line']);
        }

        if ($filters['q'] !== '') {
            $needle = '%'.strtolower($filters['q']).'%';
            $query->where(static function (Builder $builder) use ($needle): void {
                $builder->whereRaw('lower(nama_petugas) like ?', [$needle]);
            });
        }

        $submissions = $query->paginate(15)->withQueryString();

        $submissions->getCollection()->transform(
            static fn (ChecklistSubmission $s): array => $s->toSummary()
        );

        return Inertia::render('admin/submissions', [
            'submissions' => $submissions,
            'filters' => $filters,
            'options' => [
                'weeks' => ChecklistBlueprint::WEEKS,
                'lines' => ChecklistBlueprint::LINES,
                'months' => ChecklistBlueprint::MONTHS,
                'years' => $this->years(),
            ],
        ]);
    }

    public function show(ChecklistSubmission $submission): Response
    {
        $submission->loadMissing('user');

        return Inertia::render('admin/submission-detail', [
            'submission' => $submission->toDetail(),
            'blueprint' => ChecklistController::blueprintPayload(),
        ]);
    }

    /**
     * @return list<int>
     */
    private function years(): array
    {
        $years = ChecklistSubmission::query()
            ->select('period_year')
            ->distinct()
            ->orderByDesc('period_year')
            ->pluck('period_year')
            ->map(static fn (mixed $year): int => (int) $year)
            ->all();

        $current = (int) Carbon::now()->year;

        if (! in_array($current, $years, true)) {
            array_unshift($years, $current);
        }

        return array_values($years);
    }

    private function intOrNull(mixed $value): ?int
    {
        return is_numeric($value) ? (int) $value : null;
    }
}
