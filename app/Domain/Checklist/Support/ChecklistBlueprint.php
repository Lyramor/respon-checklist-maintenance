<?php

declare(strict_types=1);

namespace App\Domain\Checklist\Support;

/**
 * Sumber kebenaran tunggal untuk isi checklist.
 *
 * Dipakai bersama oleh form React, aturan validasi, dan penulis laporan Excel,
 * supaya ketiganya tidak pernah berbeda isi maupun urutan.
 */
final class ChecklistBlueprint
{
    public const SEVERITY_OK = 'ok';

    public const SEVERITY_WARN = 'warn';

    public const SEVERITY_BAD = 'bad';

    public const WEEKS = [1, 2, 3, 4, 5];

    public const LINES = [1, 2, 3, 5];

    public const MONTHS = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
        5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
        9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
    ];

    private const BENDA_KERAS = 'Benda asing keras/tajam (serpihan plastik flash dari material, serpihan material, akrilik, kabel ties, logam, baud, dll)';

    private const BENDA_LUNAK = 'Benda asing tidak keras/tidak tajam (serpihan plastik kemasan material, lakban, kertas, dll)';

    /**
     * @return array<string, list<array{value: string, severity: string}>>
     */
    public static function optionSets(): array
    {
        $ok = self::SEVERITY_OK;
        $warn = self::SEVERITY_WARN;
        $bad = self::SEVERITY_BAD;

        return [
            'YATIDAK' => [
                ['value' => 'Iya', 'severity' => $ok],
                ['value' => 'Tidak', 'severity' => $bad],
            ],
            'SUDAHBELUM' => [
                ['value' => 'Sudah dilakukan', 'severity' => $ok],
                ['value' => 'Belum dilakukan', 'severity' => $bad],
            ],
            'SESUAI' => [
                ['value' => 'Sesuai', 'severity' => $ok],
                ['value' => 'Tidak sesuai', 'severity' => $bad],
            ],
            'LENGKAP' => [
                ['value' => 'Lengkap dan Terpasang', 'severity' => $ok],
                ['value' => 'Tidak Lengkap/Belum Terpasang', 'severity' => $bad],
            ],
            'KONTAMINASI' => [
                ['value' => 'Tidak Ada Potensi Kontaminasi', 'severity' => $ok],
                ['value' => 'Ada Potensi Kontaminasi', 'severity' => $bad],
            ],
            'SUHU' => [
                ['value' => 'A : < 24°C', 'severity' => $ok],
                ['value' => 'B : 24 - 25°C', 'severity' => $warn],
                ['value' => 'C : > 25°C', 'severity' => $bad],
            ],
            'LEMBAB' => [
                ['value' => 'A : ≤ 65%', 'severity' => $ok],
                ['value' => 'B : 66 - 70%', 'severity' => $warn],
                ['value' => 'C : > 70%', 'severity' => $bad],
            ],
            'PRESSRUANG' => [
                ['value' => 'A : Positive over pressure', 'severity' => $ok],
                ['value' => 'B : -', 'severity' => $warn],
                ['value' => 'C : Negative', 'severity' => $bad],
            ],
            'PRESSCAB' => [
                ['value' => 'A : ≥ 2 pascal', 'severity' => $ok],
                ['value' => 'B : -', 'severity' => $warn],
                ['value' => 'C : < 2 pascal', 'severity' => $bad],
            ],
            'TEMUAN' => [
                ['value' => 'Tidak ditemukan', 'severity' => $ok],
                ['value' => '< 2 mm', 'severity' => $warn],
                ['value' => '2 - 7 mm', 'severity' => $warn],
                ['value' => '2 - 7 mm jika diameter ≥ 2 mm', 'severity' => $bad],
                ['value' => '> 7 mm', 'severity' => $bad],
                ['value' => '> 7 mm dan jika diameter ≥ 2 mm', 'severity' => $bad],
            ],
        ];
    }

    /**
     * @return list<array{title: string, hint: string, items: list<array{key: string, label: string, type: string, optionSet: ?string}>}>
     */
    public static function sections(): array
    {
        return [
            [
                'title' => 'Before Maintenance',
                'hint' => 'Diisi sebelum pekerjaan maintenance dimulai.',
                'items' => [
                    self::option('apd', 'Gunakan APD yang sesuai dengan STD hygiene area HCA', 'YATIDAK'),
                    self::option('tools_hca', 'Menggunakan tools khusus area HCA', 'YATIDAK'),
                    self::option('sanitasi_peralatan', 'Jika membawa peralatan dari luar, pastikan melakukan sanitasi sebelum peralatan masuk, dan mengisi checklist mudah pecah jika peralatan menggunakan material seperti kaca/akrilik', 'SUDAHBELUM'),
                    self::note('ket_before', 'Keterangan (Before Maintenance)'),
                ],
            ],
            [
                'title' => 'Off Maintenance Area',
                'hint' => 'Kondisi ruangan dan cabinet saat mesin berhenti.',
                'items' => [
                    self::option('suhu_ruangan', 'Off Maintenance Area (Suhu Ruangan)', 'SUHU'),
                    self::option('kelembaban', 'Off Maintenance Area (Kelembaban)', 'LEMBAB'),
                    self::option('press_ruangan', 'Off Maintenance Area (Positive Pressure Ruangan)', 'PRESSRUANG'),
                    self::option('suhu_cabinet', 'Off Maintenance Area (Suhu Filling Cabinet)', 'SUHU'),
                    self::option('press_cabinet', 'Off Maintenance Area (Positive Pressure Cabinet)', 'PRESSCAB'),
                    self::note('ket_off_maintenance', 'Keterangan (Off Maintenance Area)'),
                ],
            ],
            [
                'title' => 'Temuan Mikroplastik',
                'hint' => 'Catat temuan terbesar yang ada di area.',
                'items' => [
                    self::option('mikro_keras', 'Temuan mikroplastik : '.self::BENDA_KERAS, 'TEMUAN'),
                    self::note('ket_mikro_keras', 'Keterangan temuan mikroplastik (benda keras/tajam)'),
                    self::option('mikro_tidak_keras', 'Temuan mikroplastik : '.self::BENDA_LUNAK, 'TEMUAN'),
                    self::note('ket_mikro_tidak_keras', 'Keterangan temuan mikroplastik (benda tidak keras/tidak tajam)'),
                ],
            ],
            [
                'title' => 'Temuan Dedust Cap',
                'hint' => 'Periksa hasil dedust pada cap.',
                'items' => [
                    self::option('dedust_cap_keras', 'Temuan dedust cap : '.self::BENDA_KERAS, 'TEMUAN'),
                    self::note('ket_dedust_cap_keras', 'Keterangan temuan dedust cap (benda keras/tajam)'),
                    self::option('dedust_cap_tidak_keras', 'Temuan dedust cap : Benda asing tidak keras/tidak tajam (serpihan plastik kemasan, lakban, kertas, dll)', 'TEMUAN'),
                    self::note('ket_dedust_cap_tidak_keras', 'Keterangan temuan dedust cap (benda tidak keras/tidak tajam)'),
                ],
            ],
            [
                'title' => 'Temuan Dedust Preform',
                'hint' => 'Periksa hasil dedust pada preform.',
                'items' => [
                    self::option('preform_keras', 'Temuan dedust preform : Benda asing keras/tajam (serpihan material, akrilik, kabel ties, logam, baud, dll)', 'TEMUAN'),
                    self::note('ket_preform_keras', 'Keterangan temuan dedust preform (benda keras/tajam)'),
                    self::option('preform_tidak_keras', 'Temuan dedust preform : '.self::BENDA_LUNAK, 'TEMUAN'),
                    self::note('ket_preform_tidak_keras', 'Keterangan temuan dedust preform (benda tidak keras/tidak tajam)'),
                ],
            ],
            [
                'title' => 'After Maintenance',
                'hint' => 'Diisi setelah pekerjaan selesai dan area dirapikan.',
                'items' => [
                    self::option('area_bersih', 'Kondisi area dan mesin bersih', 'YATIDAK'),
                    self::option('ceceran_grease', 'Tidak ada ceceran grease, chemical dll / kelebihan penggunaan grease dll', 'SESUAI'),
                    self::option('tools_dibersihkan', 'Semua tools dibersihkan, dirapihkan, dan disimpan ke area yang telah ditentukan', 'YATIDAK'),
                    self::option('kelengkapan_mesin', 'Periksa kelengkapan mesin dan peralatan seperti baud dll, tidak ada yang tertinggal atau belum dipasang', 'LENGKAP'),
                    self::option('potensi_kontaminasi', 'Pastikan tidak ada potensi kontaminasi dari aktivitas maintenance/perbaikan mesin yang tidak sesuai', 'KONTAMINASI'),
                ],
            ],
            [
                'title' => 'Pengecekan Infrastruktur',
                'hint' => 'Kondisi bangunan di sekitar area kerja.',
                'items' => [
                    self::option('lampu', 'Pengecekan infrastruktur : semua lampu berfungsi', 'YATIDAK'),
                    self::option('lantai_dinding', 'Tidak ada lantai atau dinding yang retak', 'YATIDAK'),
                    self::option('epoxy', 'Tidak ada epoxy yang mengelupas', 'YATIDAK'),
                    self::option('celah_dinding', 'Tidak ada celah dinding', 'YATIDAK'),
                ],
            ],
        ];
    }

    /**
     * @return list<array{key: string, label: string, type: string, optionSet: ?string}>
     */
    public static function items(): array
    {
        return array_merge(...array_column(self::sections(), 'items'));
    }

    /**
     * @return list<string>
     */
    public static function optionKeys(): array
    {
        return self::keysOfType('option');
    }

    /**
     * @return list<string>
     */
    public static function noteKeys(): array
    {
        return self::keysOfType('note');
    }

    /**
     * @return list<string>
     */
    public static function valuesFor(string $optionSet): array
    {
        return array_column(self::optionSets()[$optionSet] ?? [], 'value');
    }

    public static function labelFor(string $key): string
    {
        foreach (self::items() as $item) {
            if ($item['key'] === $key) {
                return $item['label'];
            }
        }

        return $key;
    }

    public static function severityFor(string $key, ?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        foreach (self::items() as $item) {
            if ($item['key'] !== $key || $item['optionSet'] === null) {
                continue;
            }

            foreach (self::optionSets()[$item['optionSet']] as $option) {
                if ($option['value'] === $value) {
                    return $option['severity'];
                }
            }
        }

        return null;
    }

    /**
     * @return list<string>
     */
    private static function keysOfType(string $type): array
    {
        $keys = [];

        foreach (self::items() as $item) {
            if ($item['type'] === $type) {
                $keys[] = $item['key'];
            }
        }

        return $keys;
    }

    /**
     * @return array{key: string, label: string, type: string, optionSet: string}
     */
    private static function option(string $key, string $label, string $set): array
    {
        return ['key' => $key, 'label' => $label, 'type' => 'option', 'optionSet' => $set];
    }

    /**
     * @return array{key: string, label: string, type: string, optionSet: null}
     */
    private static function note(string $key, string $label): array
    {
        return ['key' => $key, 'label' => $label, 'type' => 'note', 'optionSet' => null];
    }
}
