<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Checklist\Models\ChecklistSubmission;
use App\Domain\Checklist\Support\ChecklistBlueprint;
use App\Domain\Identity\Models\User;
use App\Domain\Reporting\Models\ReportExport;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\Feature\Concerns\InteractsWithInertia;
use Tests\TestCase;

class ReportExportTest extends TestCase
{
    use InteractsWithInertia, RefreshDatabase;

    public function test_admin_can_export_download_and_delete_a_report(): void
    {
        $admin = User::factory()->admin()->create();
        $now = Carbon::now();

        $this->makeSubmission($admin, (int) $now->year, (int) $now->month);

        $this->actingAs($admin)->post('/admin/reports', [
            'year' => (int) $now->year,
            'month' => (int) $now->month,
        ])->assertRedirect('/admin/reports')->assertSessionHas('success');

        $this->assertDatabaseCount('report_exports', 1);
        $this->assertDatabaseHas('activity_logs', ['user_id' => $admin->id]);

        $export = ReportExport::query()->firstOrFail();
        $this->assertSame((int) $now->year, $export->period_year);
        $this->assertSame((int) $now->month, $export->period_month);
        $this->assertNotSame('', $export->filename);

        $this->actingAs($admin)
            ->get('/admin/reports/'.$export->id.'/download')
            ->assertOk();

        $this->actingAs($admin)
            ->delete('/admin/reports/'.$export->id)
            ->assertRedirect('/admin/reports')
            ->assertSessionHas('success');

        $this->assertDatabaseCount('report_exports', 0);
    }

    public function test_export_form_rejects_an_invalid_period(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/admin/reports', [
            'year' => 1999,
            'month' => 13,
        ])->assertSessionHasErrors(['year', 'month']);

        $this->assertDatabaseCount('report_exports', 0);
    }

    public function test_download_of_a_missing_file_returns_an_error_flash(): void
    {
        $admin = User::factory()->admin()->create();

        $export = ReportExport::query()->create([
            'user_id' => $admin->id,
            'period_year' => 2026,
            'period_month' => 8,
            'filename' => 'laporan-hilang.xlsx',
            'path' => 'reports/laporan-hilang.xlsx',
            'size_bytes' => 1024,
            'submissions_count' => 0,
        ]);

        $this->actingAs($admin)
            ->get('/admin/reports/'.$export->id.'/download')
            ->assertRedirect('/admin/reports')
            ->assertSessionHas('error');
    }

    public function test_responden_is_forbidden_on_every_report_route(): void
    {
        $responden = User::factory()->create();

        $export = ReportExport::query()->create([
            'user_id' => null,
            'period_year' => 2026,
            'period_month' => 8,
            'filename' => 'laporan.xlsx',
            'path' => 'reports/laporan.xlsx',
            'size_bytes' => 2048,
            'submissions_count' => 1,
        ]);

        $this->actingAs($responden)->inertiaGet('/admin/reports')->assertForbidden();
        $this->actingAs($responden)->post('/admin/reports', ['year' => 2026, 'month' => 8])->assertForbidden();
        $this->actingAs($responden)->get('/admin/reports/'.$export->id.'/download')->assertForbidden();
        $this->actingAs($responden)->delete('/admin/reports/'.$export->id)->assertForbidden();
    }

    private function makeSubmission(User $user, int $year, int $month): ChecklistSubmission
    {
        $answers = [];

        foreach (ChecklistBlueprint::items() as $item) {
            $answers[$item['key']] = $item['type'] === 'option' && $item['optionSet'] !== null
                ? ChecklistBlueprint::valuesFor($item['optionSet'])[0]
                : null;
        }

        return ChecklistSubmission::query()->create([
            'user_id' => $user->getKey(),
            'nama_petugas' => $user->name,
            'tanggal_pemeriksaan' => Carbon::create($year, $month, 5)->toDateString(),
            'week' => 1,
            'line' => 1,
            'period_year' => $year,
            'period_month' => $month,
            'answers' => $answers,
        ]);
    }
}
