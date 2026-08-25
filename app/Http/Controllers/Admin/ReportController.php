<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Domain\Checklist\Support\ChecklistBlueprint;
use App\Domain\Identity\Models\User;
use App\Domain\Reporting\Models\ReportExport;
use App\Domain\Reporting\Services\MonthlyReportService;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    public function __construct(private readonly MonthlyReportService $reports) {}

    public function index(Request $request): Response
    {
        $now = Carbon::now();

        $exports = ReportExport::query()
            ->with('user')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        $exports->getCollection()->transform(
            static fn (ReportExport $export): array => $export->toRow()
        );

        return Inertia::render('admin/reports', [
            'periods' => $this->reports->availablePeriods(),
            'exports' => $exports,
            'defaults' => [
                'year' => (int) $now->year,
                'month' => (int) $now->month,
            ],
            'years' => range((int) $now->year - 2, (int) $now->year + 1),
            'months' => ChecklistBlueprint::MONTHS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'year' => ['required', 'integer', 'min:2020', 'max:2100'],
            'month' => ['required', 'integer', 'min:1', 'max:12'],
        ], [
            'year.required' => 'Tahun belum dipilih.',
            'year.integer' => 'Tahun tidak valid.',
            'year.min' => 'Tahun tidak valid.',
            'year.max' => 'Tahun tidak valid.',
            'month.required' => 'Bulan belum dipilih.',
            'month.integer' => 'Bulan tidak valid.',
            'month.min' => 'Bulan tidak valid.',
            'month.max' => 'Bulan tidak valid.',
        ]);

        /** @var User $actor */
        $actor = $request->user();

        $year = (int) $validated['year'];
        $month = (int) $validated['month'];

        $this->reports->generate($year, $month, $actor);

        $label = (ChecklistBlueprint::MONTHS[$month] ?? (string) $month).' '.$year;

        return redirect()->route('admin.reports.index')
            ->with('success', 'Laporan periode '.$label.' berhasil dibuat.');
    }

    public function download(ReportExport $export): BinaryFileResponse|RedirectResponse
    {
        $absolute = $this->resolveStoredFile($export->path);

        if ($absolute === null) {
            return redirect()->route('admin.reports.index')
                ->with('error', 'Berkas laporan sudah tidak ada di server. Silakan buat laporannya lagi.');
        }

        return response()->download($absolute, $export->filename);
    }

    /**
     * Path disimpan relatif terhadap disk local, tetapi tetap dicoba beberapa
     * lokasi lain supaya berkas lama tetap bisa diunduh.
     */
    private function resolveStoredFile(string $path): ?string
    {
        $candidates = [
            Storage::disk('local')->path($path),
            storage_path('app/'.ltrim($path, '/')),
            $path,
        ];

        foreach ($candidates as $candidate) {
            if (is_file($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    public function destroy(Request $request, ReportExport $export): RedirectResponse
    {
        /** @var User $actor */
        $actor = $request->user();

        $label = $export->label();

        $this->reports->remove($export, $actor);

        return redirect()->route('admin.reports.index')
            ->with('success', 'Laporan periode '.$label.' berhasil dihapus.');
    }
}
