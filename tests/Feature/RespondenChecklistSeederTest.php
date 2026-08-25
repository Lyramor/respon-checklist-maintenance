<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Checklist\Models\ChecklistSubmission;
use App\Domain\Checklist\Support\ChecklistBlueprint;
use App\Domain\Identity\Models\User;
use Database\Seeders\RespondenChecklistSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class RespondenChecklistSeederTest extends TestCase
{
    use RefreshDatabase;

    private function jalankanSeeder(): void
    {
        $this->seed(RespondenChecklistSeeder::class);
    }

    public function test_menghasilkan_satu_bulan_penuh_dua_puluh_slot(): void
    {
        $this->jalankanSeeder();

        $now = Carbon::now();
        $submissions = ChecklistSubmission::query()
            ->where('period_year', $now->year)
            ->where('period_month', $now->month)
            ->get();

        $this->assertCount(20, $submissions);

        $slots = $submissions->map(fn (ChecklistSubmission $s): string => $s->week.'-'.$s->line);
        $this->assertCount(20, $slots->unique(), 'Tiap kombinasi week dan line hanya boleh terisi sekali.');
    }

    public function test_satu_petugas_memegang_satu_line(): void
    {
        $this->jalankanSeeder();

        foreach (ChecklistBlueprint::LINES as $line) {
            $petugas = ChecklistSubmission::query()
                ->where('line', $line)
                ->pluck('user_id')
                ->unique();

            $this->assertCount(1, $petugas, "Line {$line} harus dipegang satu orang saja.");

            $minggu = ChecklistSubmission::query()->where('line', $line)->pluck('week')->sort()->values()->all();
            $this->assertSame(ChecklistBlueprint::WEEKS, $minggu, "Line {$line} harus terisi di kelima minggu.");
        }

        $this->assertSame(
            count(ChecklistBlueprint::LINES),
            ChecklistSubmission::query()->distinct()->count('user_id'),
        );
    }

    public function test_semua_item_dropdown_terisi_nilai_yang_sah(): void
    {
        $this->jalankanSeeder();

        $sets = ChecklistBlueprint::optionSets();

        foreach (ChecklistSubmission::all() as $submission) {
            foreach (ChecklistBlueprint::items() as $item) {
                if ($item['type'] !== 'option') {
                    continue;
                }

                $nilai = $submission->answers[$item['key']] ?? null;

                $this->assertNotNull($nilai, "Item {$item['key']} kosong pada submission {$submission->id}.");
                $this->assertContains(
                    $nilai,
                    array_column($sets[$item['optionSet']], 'value'),
                    "Nilai '{$nilai}' bukan pilihan sah untuk {$item['key']}.",
                );
            }
        }
    }

    public function test_ada_temuan_kuning_dan_merah_supaya_warna_laporan_terlihat(): void
    {
        $this->jalankanSeeder();

        $total = ['ok' => 0, 'warn' => 0, 'bad' => 0];

        foreach (ChecklistSubmission::all() as $submission) {
            foreach ($submission->severityCounts() as $tingkat => $jumlah) {
                $total[$tingkat] += $jumlah;
            }
        }

        $this->assertGreaterThan(0, $total['warn'], 'Harus ada minimal satu temuan kuning.');
        $this->assertGreaterThan(0, $total['bad'], 'Harus ada minimal satu temuan merah.');
        $this->assertGreaterThan($total['warn'] + $total['bad'], $total['ok'], 'Mayoritas tetap kondisi sesuai standar.');
        $this->assertSame(
            20 * count(ChecklistBlueprint::optionKeys()),
            array_sum($total),
        );
    }

    public function test_aman_dijalankan_dua_kali(): void
    {
        $this->jalankanSeeder();
        $this->jalankanSeeder();

        $this->assertSame(20, ChecklistSubmission::query()->count());
        $this->assertSame(
            count(ChecklistBlueprint::LINES),
            User::query()->where('role', User::ROLE_RESPONDEN)->count(),
        );
    }
}
