<?php

declare(strict_types=1);

namespace App\Domain\Reporting\Services;

use App\Domain\Activity\Services\ActivityLogger;
use App\Domain\Checklist\Models\ChecklistSubmission;
use App\Domain\Checklist\Support\ChecklistBlueprint;
use App\Domain\Identity\Models\User;
use App\Domain\Reporting\Models\ReportExport;
use DateTimeInterface;
use Illuminate\Support\Facades\File;

/**
 * Penyedia laporan bulanan.
 *
 * Bertanggung jawab atas pemilihan periode, pengambilan data submission,
 * penamaan berkas, riwayat ekspor, dan lokasi penyimpanan. Bentuk workbook-nya
 * sendiri ditulis oleh MonthlyReportWriter.
 */
final class MonthlyReportService
{
    private const BASE_NAME = 'Checklist Monitoring Maintenance';

    private const RELATIVE_DIRECTORY = 'reports';

    public function __construct(
        private readonly MonthlyReportWriter $writer = new MonthlyReportWriter(),
    ) {}

    /**
     * Daftar periode yang sudah punya submission, terbaru lebih dulu.
     *
     * @return list<array{year: int, month: int, label: string, submissions: int}>
     */
    public function availablePeriods(): array
    {
        $rows = ChecklistSubmission::query()
            ->selectRaw('period_year, period_month, COUNT(*) as total')
            ->groupBy('period_year', 'period_month')
            ->orderByDesc('period_year')
            ->orderByDesc('period_month')
            ->get();

        $periods = [];

        foreach ($rows as $row) {
            $year = (int) $row->period_year;
            $month = (int) $row->period_month;

            $periods[] = [
                'year' => $year,
                'month' => $month,
                'label' => $this->label($year, $month),
                'submissions' => (int) $row->total,
            ];
        }

        return $periods;
    }

    /**
     * Nama berkas yang enak dibaca untuk satu periode.
     */
    public function filename(int $year, int $month): string
    {
        return sprintf('%s - %s.xlsx', self::BASE_NAME, $this->label($year, $month));
    }

    /**
     * Tulis workbook satu periode dan kembalikan path absolutnya.
     *
     * Bulan tanpa submission tetap menghasilkan template kosong, bukan error.
     */
    public function build(int $year, int $month): string
    {
        $path = $this->directory().DIRECTORY_SEPARATOR.$this->filename($year, $month);

        $this->writer->write($year, $month, $this->entriesFor($year, $month), $path);

        return $path;
    }

    /**
     * Buat berkas laporan lalu simpan barisnya di riwayat ekspor.
     */
    public function generate(int $year, int $month, User $actor): ReportExport
    {
        $source = $this->build($year, $month);

        $filename = $this->uniqueFilename($year, $month);
        $target = $this->directory().DIRECTORY_SEPARATOR.$filename;
        File::move($source, $target);

        $export = new ReportExport();
        $export->user_id = $actor->getKey();
        $export->period_year = $year;
        $export->period_month = $month;
        $export->filename = $filename;
        $export->path = self::RELATIVE_DIRECTORY.'/'.$filename;
        $export->size_bytes = (int) (File::size($target) ?: 0);
        $export->submissions_count = $this->submissionCount($year, $month);
        $export->save();

        $this->log(
            'report.generate',
            sprintf('Membuat laporan bulanan periode %s.', $this->label($year, $month)),
            $actor,
            $export
        );

        return $export;
    }

    /**
     * Hapus satu berkas riwayat beserta barisnya. Aman jika berkasnya sudah hilang.
     */
    public function remove(ReportExport $export, User $actor): void
    {
        $path = $this->absolutePathFor($export);

        if (File::exists($path)) {
            File::delete($path);
        }

        $label = $this->label((int) $export->period_year, (int) $export->period_month);
        $export->delete();

        $this->log(
            'report.delete',
            sprintf('Menghapus berkas laporan bulanan periode %s.', $label),
            $actor
        );
    }

    /**
     * Path absolut berkas milik satu baris riwayat.
     */
    public function absolutePathFor(ReportExport $export): string
    {
        return storage_path('app/'.ltrim((string) $export->path, '/\\'));
    }

    public function label(int $year, int $month): string
    {
        return sprintf('%s %d', ChecklistBlueprint::MONTHS[$month] ?? (string) $month, $year);
    }

    // ---------------------------------------------------------------- internal

    /**
     * Submission satu periode, satu isian terbaru per kombinasi week/line.
     *
     * @return list<array{week: int, line: int, nama_petugas: ?string, tanggal_pemeriksaan: ?DateTimeInterface, answers: array<string, ?string>}>
     */
    private function entriesFor(int $year, int $month): array
    {
        $submissions = ChecklistSubmission::query()
            ->where('period_year', $year)
            ->where('period_month', $month)
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();

        $latest = [];

        foreach ($submissions as $submission) {
            $week = (int) $submission->week;
            $line = (int) $submission->line;

            $latest[$week.'-'.$line] = [
                'week' => $week,
                'line' => $line,
                'nama_petugas' => $this->text($submission->nama_petugas),
                'tanggal_pemeriksaan' => $this->date($submission->tanggal_pemeriksaan),
                'answers' => $this->answers($submission->answers),
            ];
        }

        return array_values($latest);
    }

    private function submissionCount(int $year, int $month): int
    {
        return ChecklistSubmission::query()
            ->where('period_year', $year)
            ->where('period_month', $month)
            ->count();
    }

    /**
     * @return array<string, ?string>
     */
    private function answers(mixed $raw): array
    {
        if (is_string($raw)) {
            $raw = json_decode($raw, true);
        }

        if (! is_array($raw)) {
            return [];
        }

        $answers = [];

        foreach ($raw as $key => $value) {
            if (! is_string($key) || is_array($value)) {
                continue;
            }

            $answers[$key] = $value === null ? null : $this->text((string) $value);
        }

        return $answers;
    }

    private function text(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $text = trim((string) $value);

        return $text === '' ? null : $text;
    }

    private function date(mixed $value): ?DateTimeInterface
    {
        if ($value instanceof DateTimeInterface) {
            return $value;
        }

        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        try {
            return new \DateTimeImmutable($value);
        } catch (\Exception) {
            return null;
        }
    }

    private function uniqueFilename(int $year, int $month): string
    {
        $label = $this->label($year, $month);
        $stamp = date('Ymd-Hi');
        $name = sprintf('%s - %s (%s).xlsx', self::BASE_NAME, $label, $stamp);
        $sequence = 2;

        while (File::exists($this->directory().DIRECTORY_SEPARATOR.$name)) {
            $name = sprintf('%s - %s (%s-%d).xlsx', self::BASE_NAME, $label, $stamp, $sequence);
            $sequence++;
        }

        return $name;
    }

    private function directory(): string
    {
        $directory = storage_path('app/'.self::RELATIVE_DIRECTORY);

        File::ensureDirectoryExists($directory);

        return $directory;
    }

    private function log(string $action, string $description, User $actor, ?ReportExport $subject = null): void
    {
        ActivityLogger::log($action, $description, $actor, $subject);
    }
}
