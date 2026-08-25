<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\Checklist\Models\ChecklistSubmission;
use App\Domain\Checklist\Services\ChecklistService;
use App\Domain\Checklist\Support\ChecklistBlueprint;
use App\Domain\Identity\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Mengisi satu bulan penuh: empat petugas, satu orang memegang satu line,
 * masing masing mengisi kelima minggu. Hasilnya 20 slot terisi, sama dengan
 * jumlah kolom pada sheet Excel bulanan.
 *
 * Aman dijalankan berulang kali. Isian milik keempat petugas ini pada periode
 * yang dituju dihapus dulu sebelum dibuat ulang, jadi tidak menumpuk.
 */
class RespondenChecklistSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Satu petugas untuk satu line.
     *
     * @var list<array{line: int, name: string, username: string, email: string}>
     */
    private const PETUGAS = [
        ['line' => 1, 'name' => 'Agus Prasetyo', 'username' => 'agus_line1', 'email' => 'agus@krevostudio.com'],
        ['line' => 2, 'name' => 'Dewi Lestari', 'username' => 'dewi_line2', 'email' => 'dewi@krevostudio.com'],
        ['line' => 3, 'name' => 'Rizky Maulana', 'username' => 'rizky_line3', 'email' => 'rizky@krevostudio.com'],
        ['line' => 5, 'name' => 'Siti Rahayu', 'username' => 'siti_line5', 'email' => 'siti@krevostudio.com'],
    ];

    /**
     * Temuan yang sengaja ditanam supaya warna kuning dan merah ikut terlihat
     * di laporan dan di halaman detail. Kunci peta ini adalah "line-minggu".
     * Nilai pada 'opsi' adalah indeks pilihan pada set opsi item tersebut.
     *
     * @var array<string, array{opsi?: array<string, int>, catatan?: array<string, string>}>
     */
    private const TEMUAN = [
        '1-2' => [
            'opsi' => ['suhu_ruangan' => 1],
            'catatan' => ['ket_off_maintenance' => 'Suhu naik sebentar karena pintu area sering dibuka saat penggantian part.'],
        ],
        '1-5' => [
            'opsi' => ['suhu_cabinet' => 1, 'press_cabinet' => 1],
            'catatan' => ['ket_off_maintenance' => 'Cabinet baru stabil sekitar 15 menit setelah mesin dinyalakan lagi.'],
        ],
        '2-1' => [
            'opsi' => ['mikro_keras' => 1],
            'catatan' => ['ket_mikro_keras' => 'Serpihan plastik flash di dekat conveyor, sudah diambil dan area dibersihkan.'],
        ],
        '2-3' => [
            'opsi' => ['lampu' => 1],
        ],
        '2-4' => [
            'opsi' => ['dedust_cap_tidak_keras' => 2],
            'catatan' => ['ket_dedust_cap_tidak_keras' => 'Potongan lakban ukuran sekitar 4 mm, sudah diambil dan dilaporkan ke leader.'],
        ],
        '3-1' => [
            'catatan' => ['ket_before' => 'Membawa kunci torsi dari workshop, sanitasi dilakukan di ruang antara.'],
        ],
        '3-3' => [
            'opsi' => ['kelembaban' => 1, 'press_ruangan' => 1],
            'catatan' => ['ket_off_maintenance' => 'Kelembaban 68 persen, blower sedang dicek teknisi utility.'],
        ],
        '3-5' => [
            'opsi' => ['epoxy' => 1],
        ],
        '5-2' => [
            'opsi' => ['preform_keras' => 3],
            'catatan' => ['ket_preform_keras' => 'Ditemukan pecahan akrilik, mesin dihentikan dan preform di sekitar titik temuan dikarantina.'],
        ],
        '5-4' => [
            'opsi' => ['ceceran_grease' => 1],
            'catatan' => ['ket_mikro_tidak_keras' => 'Ada sisa grease di sekitar bearing, sudah dilap dan dicek ulang.'],
        ],
    ];

    public function run(): void
    {
        $tanggal = $this->tanggalPerMinggu();
        $periode = Carbon::now();

        foreach (self::PETUGAS as $data) {
            $petugas = User::query()->updateOrCreate(
                ['username' => $data['username']],
                [
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => 'password',
                    'role' => User::ROLE_RESPONDEN,
                    'is_active' => true,
                ],
            );

            // Supaya seeder tetap aman dijalankan berulang kali.
            ChecklistSubmission::query()
                ->where('user_id', $petugas->getKey())
                ->where('period_year', $periode->year)
                ->where('period_month', $periode->month)
                ->delete();

            foreach (ChecklistBlueprint::WEEKS as $minggu) {
                $submission = ChecklistService::store([
                    'nama_petugas' => $petugas->name,
                    'tanggal_pemeriksaan' => $tanggal[$minggu]->toDateString(),
                    'week' => $minggu,
                    'line' => $data['line'],
                    'answers' => $this->jawaban($data['line'], $minggu),
                ], $petugas);

                // Waktu simpan disamakan dengan tanggal pemeriksaan supaya urutan
                // riwayat dan pemilihan isian terbaru per slot masuk akal.
                $submission->forceFill([
                    'created_at' => $tanggal[$minggu]->copy()->setTime(8 + $data['line'], 15),
                    'updated_at' => $tanggal[$minggu]->copy()->setTime(8 + $data['line'], 15),
                ])->saveQuietly();
            }
        }

        $this->command?->info(sprintf(
            'Terisi %d checklist untuk periode %s oleh %d petugas.',
            count(self::PETUGAS) * count(ChecklistBlueprint::WEEKS),
            (ChecklistBlueprint::MONTHS[$periode->month] ?? '').' '.$periode->year,
            count(self::PETUGAS),
        ));
    }

    /**
     * Lima tanggal yang tersebar merata di bulan berjalan dan tidak pernah
     * melewati hari ini, jadi datanya tetap masuk akal kapan pun seeder dijalankan.
     *
     * @return array<int, Carbon>
     */
    private function tanggalPerMinggu(): array
    {
        $now = Carbon::now();
        $batas = min(28, (int) $now->day);
        $awal = 2;
        $jumlah = count(ChecklistBlueprint::WEEKS);
        $langkah = $batas > $awal ? ($batas - $awal) / ($jumlah - 1) : 0;

        $tanggal = [];

        foreach (ChecklistBlueprint::WEEKS as $i => $minggu) {
            $hari = (int) round($awal + ($langkah * $i));
            $tanggal[$minggu] = $now->copy()->startOfMonth()->addDays(max(0, $hari - 1));
        }

        return $tanggal;
    }

    /**
     * Semua item dropdown terisi. Yang tidak disebut di TEMUAN diisi pilihan
     * pertama, yaitu kondisi sesuai standar.
     *
     * @return array<string, string>
     */
    private function jawaban(int $line, int $minggu): array
    {
        $skenario = self::TEMUAN[$line.'-'.$minggu] ?? [];
        $opsi = $skenario['opsi'] ?? [];
        $catatan = $skenario['catatan'] ?? [];
        $sets = ChecklistBlueprint::optionSets();

        $jawaban = [];

        foreach (ChecklistBlueprint::items() as $item) {
            if ($item['type'] === 'note') {
                if (isset($catatan[$item['key']])) {
                    $jawaban[$item['key']] = $catatan[$item['key']];
                }

                continue;
            }

            $pilihan = $sets[$item['optionSet']];
            $indeks = $opsi[$item['key']] ?? 0;
            $jawaban[$item['key']] = $pilihan[$indeks]['value'];
        }

        return $jawaban;
    }
}
