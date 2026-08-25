<?php

declare(strict_types=1);

namespace App\Domain\Reporting\Services;

use App\Domain\Checklist\Support\ChecklistBlueprint;
use DateTimeInterface;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Conditional;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx as XlsxWriter;

/**
 * Penulis workbook laporan bulanan.
 *
 * Kelas ini hanya mengurus bentuk file Excel: tata letak, warna, dropdown dan
 * pewarnaan otomatis. Pengambilan data dari database ditangani oleh
 * MonthlyReportService.
 */
final class MonthlyReportWriter
{
    private const NAVY = 'FF1F4E5F';

    private const TEAL = 'FF2E7387';

    private const BAND = 'FFD9E7E9';

    private const HIJAU = 'FFB6D7A8';

    private const KUNING = 'FFFFE599';

    private const MERAH = 'FFEA9999';

    private const ABU = 'FFF2F2F2';

    private const INPUT = 'FFFFFFFF';

    private const GARIS = 'FF9AA5A8';

    private const PUTIH = 'FFFFFFFF';

    private const TEKS_CATATAN = 'FF666666';

    private const TEKS_CONTOH = 'FF555555';

    /** Kolom pertama grid week/line pada sheet CHECKLIST. */
    private const FIRST_COLUMN = 3;

    private const ROW_JUDUL = 1;

    private const ROW_PERIODE = 2;

    private const ROW_SELA = 3;

    private const ROW_WEEK = 4;

    private const ROW_LINE = 5;

    private const ROW_NAMA = 6;

    private const ROW_TANGGAL = 7;

    private const ROW_BODY = 8;

    /** Penyeragaman jawaban lama yang penulisannya berbeda. */
    private const NORMALISASI = [
        '2 - 7 mm, jika diameter ≥ 2 mm' => '2 - 7 mm jika diameter ≥ 2 mm',
        '> dari 7 mm dan jika diameter ≥ 2 mm' => '> 7 mm dan jika diameter ≥ 2 mm',
        '> 2 mm' => '> 7 mm',
    ];

    /**
     * Tulis satu workbook bulanan ke $path.
     *
     * @param  list<array{week: int, line: int, nama_petugas: ?string, tanggal_pemeriksaan: ?DateTimeInterface, answers: array<string, ?string>}>  $entries
     */
    public function write(int $year, int $month, array $entries, string $path): void
    {
        $spreadsheet = new Spreadsheet();

        $reference = $spreadsheet->getActiveSheet();
        $reference->setTitle('REFERENSI');
        $formulas = $this->buildReference($reference);
        $reference->setSheetState(Worksheet::SHEETSTATE_HIDDEN);

        $checklist = $spreadsheet->createSheet();
        $checklist->setTitle('CHECKLIST');
        $this->buildChecklist($checklist, $year, $month, $entries, $formulas);

        $spreadsheet->setActiveSheetIndexByName('CHECKLIST');

        $writer = new XlsxWriter($spreadsheet);
        $writer->save($path);

        $spreadsheet->disconnectWorksheets();
    }

    // ---------------------------------------------------------------- REFERENSI

    /**
     * Isi sheet REFERENSI dan kembalikan rumus rentang per option set.
     *
     * @return array<string, string>
     */
    private function buildReference(Worksheet $sheet): array
    {
        $formulas = [];
        $column = 1;

        foreach (ChecklistBlueprint::optionSets() as $key => $options) {
            $letter = Coordinate::stringFromColumnIndex($column);
            $sheet->setCellValue($letter.'1', $key);
            $sheet->getStyle($letter.'1')->getFont()->setBold(true);

            foreach (array_values($options) as $index => $option) {
                $sheet->setCellValueExplicit($letter.($index + 2), $option['value'], DataType::TYPE_STRING);
            }

            $formulas[$key] = sprintf('=REFERENSI!$%s$2:$%s$%d', $letter, $letter, 1 + count($options));
            $sheet->getColumnDimension($letter)->setWidth(34);
            $column++;
        }

        $letter = Coordinate::stringFromColumnIndex($column);
        $sheet->setCellValue($letter.'1', 'BULAN');
        $sheet->getStyle($letter.'1')->getFont()->setBold(true);

        foreach (array_values(ChecklistBlueprint::MONTHS) as $index => $name) {
            $sheet->setCellValueExplicit($letter.($index + 2), $name, DataType::TYPE_STRING);
        }

        $formulas['BULAN'] = sprintf('=REFERENSI!$%s$2:$%s$13', $letter, $letter);
        $sheet->getColumnDimension($letter)->setWidth(16);

        $sheet->setCellValue('A16', 'Sheet ini berisi daftar opsi dropdown. Boleh diedit, jangan dihapus atau diganti namanya.');
        $sheet->getStyle('A16')->getFont()->setItalic(true)->setSize(9)->getColor()->setARGB(self::TEKS_CATATAN);

        return $formulas;
    }

    // ---------------------------------------------------------------- CHECKLIST

    /**
     * @param  list<array{week: int, line: int, nama_petugas: ?string, tanggal_pemeriksaan: ?DateTimeInterface, answers: array<string, ?string>}>  $entries
     * @param  array<string, string>  $formulas
     */
    private function buildChecklist(Worksheet $sheet, int $year, int $month, array $entries, array $formulas): void
    {
        $this->applyColumnWidths($sheet);
        $this->writeTitle($sheet);
        $this->writePeriodBar($sheet, $year, $month);
        $this->writeGridHeader($sheet);
        $this->writeMetaRows($sheet);

        [$bodyEnd, $optionRows] = $this->writeBody($sheet);

        $this->fillEntries($sheet, $entries);
        $this->applyValidations($sheet, $optionRows, $formulas);
        $this->applyConditionalFormatting($sheet, $optionRows);
        $this->writeLegend($sheet, $bodyEnd);
        $this->applySheetSetup($sheet);
    }

    private function applyColumnWidths(Worksheet $sheet): void
    {
        $sheet->getColumnDimension('A')->setWidth(5);
        $sheet->getColumnDimension('B')->setWidth(62);

        for ($column = self::FIRST_COLUMN; $column <= $this->lastColumn(); $column++) {
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($column))->setWidth(19);
        }
    }

    private function writeTitle(Worksheet $sheet): void
    {
        $range = 'A1:'.$this->lastLetter().'1';
        $sheet->mergeCells($range);
        $sheet->setCellValue('A1', 'CHECKLIST MONITORING SAAT MAINTENANCE & INFRASTRUKTUR');
        $this->paint($sheet, $range, self::NAVY);
        $this->font($sheet, $range, bold: true, size: 16, color: self::PUTIH);
        $this->align($sheet, $range, Alignment::HORIZONTAL_CENTER);
        $sheet->getRowDimension(self::ROW_JUDUL)->setRowHeight(34);
    }

    private function writePeriodBar(Worksheet $sheet, int $year, int $month): void
    {
        $row = self::ROW_PERIODE;
        $monthCell = $this->letter(self::FIRST_COLUMN);
        $yearCell = $this->letter(self::FIRST_COLUMN + 6);

        $blocks = [
            ['A'.$row.':B'.$row, 'BULAN', self::BAND, Alignment::HORIZONTAL_CENTER],
            [$monthCell.$row.':'.$this->letter(self::FIRST_COLUMN + 3).$row, ChecklistBlueprint::MONTHS[$month] ?? '', self::INPUT, Alignment::HORIZONTAL_CENTER],
            [$this->letter(self::FIRST_COLUMN + 4).$row.':'.$this->letter(self::FIRST_COLUMN + 5).$row, 'TAHUN', self::BAND, Alignment::HORIZONTAL_CENTER],
            [$yearCell.$row.':'.$this->letter(self::FIRST_COLUMN + 7).$row, $year, self::INPUT, Alignment::HORIZONTAL_CENTER],
        ];

        foreach ($blocks as [$range, $value, $color, $horizontal]) {
            $sheet->mergeCells($range);
            $first = explode(':', $range)[0];

            if (is_int($value)) {
                $sheet->setCellValue($first, $value);
            } else {
                $sheet->setCellValueExplicit($first, (string) $value, DataType::TYPE_STRING);
            }

            $this->paint($sheet, $range, $color);
            $this->font($sheet, $range, bold: true, size: 11);
            $this->align($sheet, $range, $horizontal);
        }

        $this->box($sheet, 'A'.$row.':'.$this->lastLetter().$row);
        $sheet->getRowDimension($row)->setRowHeight(24);
        $sheet->getRowDimension(self::ROW_SELA)->setRowHeight(8);
    }

    private function writeGridHeader(Worksheet $sheet): void
    {
        foreach ([['A', 'NO'], ['B', 'CHECKLIST ITEM']] as [$letter, $label]) {
            $range = $letter.self::ROW_WEEK.':'.$letter.self::ROW_LINE;
            $sheet->mergeCells($range);
            $sheet->setCellValue($letter.self::ROW_WEEK, $label);
            $this->paint($sheet, $range, self::NAVY);
            $this->font($sheet, $range, bold: true, size: 11, color: self::PUTIH);
            $this->align($sheet, $range, Alignment::HORIZONTAL_CENTER, wrap: true);
        }

        $column = self::FIRST_COLUMN;
        $lines = ChecklistBlueprint::LINES;

        foreach (ChecklistBlueprint::WEEKS as $week) {
            $range = $this->letter($column).self::ROW_WEEK.':'.$this->letter($column + count($lines) - 1).self::ROW_WEEK;
            $sheet->mergeCells($range);
            $sheet->setCellValue($this->letter($column).self::ROW_WEEK, 'WEEK '.$week);
            $this->paint($sheet, $range, self::NAVY);
            $this->font($sheet, $range, bold: true, size: 11, color: self::PUTIH);
            $this->align($sheet, $range, Alignment::HORIZONTAL_CENTER);

            foreach (array_values($lines) as $offset => $line) {
                $cell = $this->letter($column + $offset).self::ROW_LINE;
                $sheet->setCellValue($cell, 'LINE '.$line);
                $this->paint($sheet, $cell, self::TEAL);
                $this->font($sheet, $cell, bold: true, size: 10, color: self::PUTIH);
                $this->align($sheet, $cell, Alignment::HORIZONTAL_CENTER);
            }

            $column += count($lines);
        }

        foreach ([self::ROW_WEEK, self::ROW_LINE] as $row) {
            $sheet->getRowDimension($row)->setRowHeight(22);
            $this->box($sheet, 'A'.$row.':'.$this->lastLetter().$row);
        }
    }

    private function writeMetaRows(Worksheet $sheet): void
    {
        $rows = [self::ROW_NAMA => 'Nama Petugas', self::ROW_TANGGAL => 'Tanggal Pemeriksaan'];

        foreach ($rows as $row => $label) {
            $labelRange = 'A'.$row.':B'.$row;
            $this->paint($sheet, $labelRange, self::ABU);
            $this->box($sheet, $labelRange);
            $sheet->setCellValue('B'.$row, $label);
            $this->font($sheet, 'B'.$row, bold: true, size: 11);
            $this->align($sheet, 'B'.$row, Alignment::HORIZONTAL_LEFT, wrap: true);

            $inputRange = $this->letter(self::FIRST_COLUMN).$row.':'.$this->lastLetter().$row;
            $this->paint($sheet, $inputRange, self::INPUT);
            $this->box($sheet, $inputRange);
            $this->align($sheet, $inputRange, Alignment::HORIZONTAL_CENTER, wrap: true);
            $this->font($sheet, $inputRange, size: 10);

            if ($row === self::ROW_TANGGAL) {
                $sheet->getStyle($inputRange)->getNumberFormat()->setFormatCode('DD/MM/YYYY');
            }

            $sheet->getRowDimension($row)->setRowHeight(26);
        }
    }

    /**
     * Tulis semua section dan item checklist.
     *
     * @return array{0: int, 1: array<string, list<int>>} baris terakhir body, dan baris per option set
     */
    private function writeBody(Worksheet $sheet): array
    {
        $row = self::ROW_BODY;
        $number = 0;
        $optionRows = array_fill_keys(array_keys(ChecklistBlueprint::optionSets()), []);

        foreach (ChecklistBlueprint::sections() as $section) {
            $range = 'A'.$row.':'.$this->lastLetter().$row;
            $sheet->mergeCells($range);
            $sheet->setCellValue('A'.$row, mb_strtoupper($section['title']));
            $this->paint($sheet, $range, self::BAND);
            $this->font($sheet, $range, bold: true, size: 11, color: self::NAVY);
            $this->align($sheet, $range, Alignment::HORIZONTAL_LEFT, indent: 1);
            $this->box($sheet, $range);
            $sheet->getRowDimension($row)->setRowHeight(22);
            $row++;

            foreach ($section['items'] as $item) {
                $number++;
                $sheet->setCellValue('A'.$row, $number);
                $this->align($sheet, 'A'.$row, Alignment::HORIZONTAL_CENTER);
                $this->font($sheet, 'A'.$row, size: 10);

                $sheet->setCellValueExplicit('B'.$row, $item['label'], DataType::TYPE_STRING);
                $this->align($sheet, 'B'.$row, Alignment::HORIZONTAL_LEFT, wrap: true);
                $this->font($sheet, 'B'.$row, size: 10);

                $grid = $this->letter(self::FIRST_COLUMN).$row.':'.$this->lastLetter().$row;
                $this->align($sheet, $grid, Alignment::HORIZONTAL_CENTER, wrap: true);
                $this->font($sheet, $grid, size: 10);
                $this->box($sheet, 'A'.$row.':'.$this->lastLetter().$row);

                if ($item['optionSet'] === null) {
                    $this->paint($sheet, $grid, self::ABU);
                    $sheet->getRowDimension($row)->setRowHeight(30);
                } else {
                    $optionRows[$item['optionSet']][] = $row;
                    $sheet->getRowDimension($row)->setRowHeight(34);
                }

                $row++;
            }
        }

        return [$row - 1, $optionRows];
    }

    /**
     * @param  list<array{week: int, line: int, nama_petugas: ?string, tanggal_pemeriksaan: ?DateTimeInterface, answers: array<string, ?string>}>  $entries
     */
    private function fillEntries(Worksheet $sheet, array $entries): void
    {
        $itemRows = $this->itemRows();

        foreach ($entries as $entry) {
            $column = $this->columnFor($entry['week'], $entry['line']);

            if ($column === null) {
                continue;
            }

            $letter = $this->letter($column);

            if (($entry['nama_petugas'] ?? null) !== null && $entry['nama_petugas'] !== '') {
                $sheet->setCellValueExplicit($letter.self::ROW_NAMA, $entry['nama_petugas'], DataType::TYPE_STRING);
            }

            if (($entry['tanggal_pemeriksaan'] ?? null) instanceof DateTimeInterface) {
                $sheet->setCellValue($letter.self::ROW_TANGGAL, ExcelDate::PHPToExcel($entry['tanggal_pemeriksaan']));
            }

            foreach ($entry['answers'] as $key => $value) {
                $row = $itemRows[$key] ?? null;
                $clean = $this->normalise($value);

                if ($row === null || $clean === null) {
                    continue;
                }

                $sheet->setCellValueExplicit($letter.$row, $clean, DataType::TYPE_STRING);
            }
        }
    }

    /**
     * @param  array<string, list<int>>  $optionRows
     * @param  array<string, string>  $formulas
     */
    private function applyValidations(Worksheet $sheet, array $optionRows, array $formulas): void
    {
        foreach ($optionRows as $key => $rows) {
            if ($rows === []) {
                continue;
            }

            $sheet->setDataValidation(
                implode(' ', $this->rowRanges($rows)),
                $this->listValidation(
                    $formulas[$key],
                    'Pilihan tidak valid',
                    'Silakan pilih salah satu opsi dari dropdown.'
                )
            );
        }

        $sheet->setDataValidation(
            $this->letter(self::FIRST_COLUMN).self::ROW_PERIODE,
            $this->listValidation($formulas['BULAN'])
        );
    }

    private function listValidation(string $formula, string $errorTitle = '', string $error = ''): DataValidation
    {
        $validation = new DataValidation();
        $validation->setType(DataValidation::TYPE_LIST);
        $validation->setErrorStyle(DataValidation::STYLE_STOP);
        $validation->setAllowBlank(true);
        $validation->setShowDropDown(true);
        $validation->setShowInputMessage(false);
        $validation->setShowErrorMessage(true);
        $validation->setErrorTitle($errorTitle);
        $validation->setError($error);
        $validation->setFormula1($formula);

        return $validation;
    }

    /**
     * Aturan pewarnaan otomatis: cocok persis (EXACT), bukan pencarian sebagian.
     *
     * @param  array<string, list<int>>  $optionRows
     */
    private function applyConditionalFormatting(Worksheet $sheet, array $optionRows): void
    {
        $colors = [
            ChecklistBlueprint::SEVERITY_OK => self::HIJAU,
            ChecklistBlueprint::SEVERITY_WARN => self::KUNING,
            ChecklistBlueprint::SEVERITY_BAD => self::MERAH,
        ];
        $optionSets = ChecklistBlueprint::optionSets();

        foreach ($optionRows as $key => $rows) {
            if ($rows === []) {
                continue;
            }

            $anchor = $this->letter(self::FIRST_COLUMN).$rows[0];
            $rules = [];

            foreach ($colors as $severity => $color) {
                $values = array_column(
                    array_filter($optionSets[$key], static fn (array $o): bool => $o['severity'] === $severity),
                    'value'
                );

                if ($values === []) {
                    continue;
                }

                $tests = array_map(
                    static fn (string $value): string => sprintf('EXACT(%s,"%s")', $anchor, $value),
                    $values
                );

                $rules[] = $this->exactMatchRule('OR('.implode(',', $tests).')', $color);
            }

            $sheet->setConditionalStyles(implode(',', $this->rowRanges($rows)), $rules);
        }
    }

    private function exactMatchRule(string $formula, string $color): Conditional
    {
        $conditional = new Conditional();
        $conditional->setConditionType(Conditional::CONDITION_EXPRESSION);
        $conditional->setConditions([$formula]);
        $conditional->setStopIfTrue(true);

        $fill = $conditional->getStyle()->getFill();
        $fill->setFillType(Fill::FILL_SOLID);
        $fill->getStartColor()->setARGB($color);
        $fill->getEndColor()->setARGB($color);

        return $conditional;
    }

    private function writeLegend(Worksheet $sheet, int $bodyEnd): void
    {
        $row = $bodyEnd + 2;
        $header = 'A'.$row.':H'.$row;
        $sheet->mergeCells($header);
        $sheet->setCellValue('A'.$row, 'KETERANGAN WARNA');
        $this->paint($sheet, $header, self::NAVY);
        $this->font($sheet, $header, bold: true, size: 11, color: self::PUTIH);
        $this->align($sheet, $header, Alignment::HORIZONTAL_LEFT, indent: 1);
        $sheet->getRowDimension($row)->setRowHeight(22);

        foreach ($this->legendRows() as [$color, $name, $meaning, $examples]) {
            $row++;

            $this->paint($sheet, 'A'.$row, $color);
            $this->box($sheet, 'A'.$row);

            $sheet->setCellValueExplicit('B'.$row, $name, DataType::TYPE_STRING);
            $this->font($sheet, 'B'.$row, bold: true, size: 10);
            $this->align($sheet, 'B'.$row, Alignment::HORIZONTAL_LEFT);
            $this->box($sheet, 'B'.$row);

            $meaningRange = 'C'.$row.':E'.$row;
            $sheet->mergeCells($meaningRange);
            $sheet->setCellValueExplicit('C'.$row, $meaning, DataType::TYPE_STRING);
            $this->font($sheet, $meaningRange, size: 10);
            $this->align($sheet, $meaningRange, Alignment::HORIZONTAL_LEFT, wrap: true);
            $this->box($sheet, $meaningRange);

            $exampleRange = 'F'.$row.':'.$this->lastLetter().$row;
            $sheet->mergeCells($exampleRange);
            $sheet->setCellValueExplicit('F'.$row, $examples, DataType::TYPE_STRING);
            $this->font($sheet, $exampleRange, size: 9, color: self::TEKS_CONTOH);
            $this->align($sheet, $exampleRange, Alignment::HORIZONTAL_LEFT, wrap: true);
            $this->box($sheet, $exampleRange);

            $sheet->getRowDimension($row)->setRowHeight(30);
        }

        $row += 2;
        $noteRange = 'B'.$row.':'.$this->lastLetter().$row;
        $sheet->mergeCells($noteRange);
        $sheet->setCellValueExplicit(
            'B'.$row,
            'Catatan: warna muncul otomatis setelah opsi dipilih dari dropdown. '
            .'Nama Petugas dan Tanggal Pemeriksaan diisi per Line. '
            .'Satu sheet dipakai untuk satu bulan, duplicate sheet ini untuk bulan berikutnya.',
            DataType::TYPE_STRING
        );
        $sheet->getStyle($noteRange)->getFont()->setItalic(true)->setSize(9)->getColor()->setARGB(self::TEKS_CATATAN);
        $this->align($sheet, $noteRange, Alignment::HORIZONTAL_LEFT, wrap: true);
        $sheet->getRowDimension($row)->setRowHeight(24);
    }

    /**
     * @return list<array{0: string, 1: string, 2: string, 3: string}>
     */
    private function legendRows(): array
    {
        return [
            [
                self::HIJAU,
                'HIJAU',
                'Kondisi baik / sesuai standar',
                'Iya  |  Sesuai  |  Sudah dilakukan  |  Lengkap dan Terpasang  |  Tidak Ada Potensi Kontaminasi  |  opsi A  |  Tidak ditemukan',
            ],
            [
                self::KUNING,
                'KUNING',
                'Perlu perhatian / masih dalam batas toleransi',
                'opsi B  |  temuan < 2 mm  |  temuan 2 - 7 mm',
            ],
            [
                self::MERAH,
                'MERAH',
                'Tidak sesuai / bermasalah, perlu tindak lanjut',
                'Tidak  |  Tidak sesuai  |  Belum dilakukan  |  Tidak Lengkap/Belum Terpasang  |  Ada Potensi Kontaminasi  |  opsi C  |  temuan 2 - 7 mm dengan diameter ≥ 2 mm  |  temuan > 7 mm',
            ],
            [
                self::ABU,
                'ABU-ABU',
                'Kolom keterangan / catatan',
                'Diisi manual, tanpa dropdown dan tanpa warna otomatis',
            ],
        ];
    }

    private function applySheetSetup(Worksheet $sheet): void
    {
        $sheet->freezePane($this->letter(self::FIRST_COLUMN).self::ROW_BODY);
        $sheet->setShowGridlines(false);
        $sheet->getTabColor()->setARGB(self::NAVY);

        $setup = $sheet->getPageSetup();
        $setup->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
        $setup->setFitToPage(true);
        $setup->setFitToWidth(1);
        $setup->setFitToHeight(0);
        $setup->setRowsToRepeatAtTopByStartAndEnd(self::ROW_WEEK, self::ROW_LINE);
    }

    // ---------------------------------------------------------------- bantuan

    /**
     * Baris sheet untuk tiap key item checklist.
     *
     * @return array<string, int>
     */
    private function itemRows(): array
    {
        $rows = [];
        $row = self::ROW_BODY;

        foreach (ChecklistBlueprint::sections() as $section) {
            $row++;

            foreach ($section['items'] as $item) {
                $rows[$item['key']] = $row;
                $row++;
            }
        }

        return $rows;
    }

    /**
     * @param  list<int>  $rows
     * @return list<string>
     */
    private function rowRanges(array $rows): array
    {
        $first = $this->letter(self::FIRST_COLUMN);
        $last = $this->lastLetter();

        return array_map(
            static fn (int $row): string => sprintf('%s%d:%s%d', $first, $row, $last, $row),
            $rows
        );
    }

    private function columnFor(int $week, int $line): ?int
    {
        $weekIndex = array_search($week, ChecklistBlueprint::WEEKS, true);
        $lineIndex = array_search($line, ChecklistBlueprint::LINES, true);

        if ($weekIndex === false || $lineIndex === false) {
            return null;
        }

        return self::FIRST_COLUMN + ($weekIndex * count(ChecklistBlueprint::LINES)) + $lineIndex;
    }

    private function normalise(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $clean = trim($value);

        if ($clean === '') {
            return null;
        }

        return self::NORMALISASI[$clean] ?? $clean;
    }

    private function lastColumn(): int
    {
        return self::FIRST_COLUMN + (count(ChecklistBlueprint::WEEKS) * count(ChecklistBlueprint::LINES)) - 1;
    }

    private function lastLetter(): string
    {
        return $this->letter($this->lastColumn());
    }

    private function letter(int $column): string
    {
        return Coordinate::stringFromColumnIndex($column);
    }

    private function paint(Worksheet $sheet, string $range, string $argb): void
    {
        $fill = $sheet->getStyle($range)->getFill();
        $fill->setFillType(Fill::FILL_SOLID);
        $fill->getStartColor()->setARGB($argb);
        $fill->getEndColor()->setARGB($argb);
    }

    private function box(Worksheet $sheet, string $range): void
    {
        $sheet->getStyle($range)->getBorders()->getAllBorders()
            ->setBorderStyle(Border::BORDER_THIN)
            ->getColor()->setARGB(self::GARIS);
    }

    private function font(Worksheet $sheet, string $range, ?bool $bold = null, ?int $size = null, ?string $color = null): void
    {
        $font = $sheet->getStyle($range)->getFont();

        if ($bold !== null) {
            $font->setBold($bold);
        }

        if ($size !== null) {
            $font->setSize($size);
        }

        if ($color !== null) {
            $font->getColor()->setARGB($color);
        }
    }

    private function align(Worksheet $sheet, string $range, string $horizontal, bool $wrap = false, int $indent = 0): void
    {
        $alignment = $sheet->getStyle($range)->getAlignment();
        $alignment->setHorizontal($horizontal);
        $alignment->setVertical(Alignment::VERTICAL_CENTER);
        $alignment->setWrapText($wrap);

        if ($indent > 0) {
            $alignment->setIndent($indent);
        }
    }
}
