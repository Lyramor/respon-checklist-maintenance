<?php

declare(strict_types=1);

/**
 * Membuat ulang seluruh aset gambar milik aplikasi: ikon PWA, favicon, dan
 * gambar pratinjau untuk berbagi tautan (Open Graph).
 *
 * Jalankan dari akar project:
 *     php scripts/generate-brand-assets.php
 *
 * Butuh ekstensi GD. Semua digambar pada ukuran empat kali lipat lalu
 * diperkecil, supaya tepiannya halus tanpa perlu pustaka tambahan.
 */

if (! extension_loaded('gd')) {
    fwrite(STDERR, "Ekstensi GD belum aktif.\n");
    exit(1);
}

const BRAND = [0x1F, 0x4E, 0x5F];
const PUTIH = [0xFF, 0xFF, 0xFF];
const REDUP = [0x7E, 0x9B, 0xA6];
const LEMBUT = [0xD9, 0xE7, 0xE9];
const HIJAU = [0xB6, 0xD7, 0xA8];
const KUNING = [0xFF, 0xE5, 0x99];
const MERAH = [0xEA, 0x99, 0x99];

const SKALA = 4;
const PUBLIC_DIR = __DIR__.'/../public';

/**
 * @param  array{int, int, int}  $rgb
 */
function warna(GdImage $img, array $rgb, int $alpha = 0): int
{
    return imagecolorallocatealpha($img, $rgb[0], $rgb[1], $rgb[2], $alpha);
}

function kanvas(int $w, int $h): GdImage
{
    $img = imagecreatetruecolor($w, $h);
    imagealphablending($img, false);
    imagesavealpha($img, true);
    imagefill($img, 0, 0, imagecolorallocatealpha($img, 0, 0, 0, 127));
    imagealphablending($img, true);

    return $img;
}

function persegiBulat(GdImage $img, float $x, float $y, float $w, float $h, float $r, int $c): void
{
    $r = min($r, $w / 2, $h / 2);
    imagefilledrectangle($img, (int) ($x + $r), (int) $y, (int) ($x + $w - $r), (int) ($y + $h), $c);
    imagefilledrectangle($img, (int) $x, (int) ($y + $r), (int) ($x + $w), (int) ($y + $h - $r), $c);

    foreach ([[$x + $r, $y + $r], [$x + $w - $r, $y + $r], [$x + $r, $y + $h - $r], [$x + $w - $r, $y + $h - $r]] as [$cx, $cy]) {
        imagefilledellipse($img, (int) $cx, (int) $cy, (int) ($r * 2), (int) ($r * 2), $c);
    }
}

/** Garis tebal dengan ujung membulat, dipakai untuk menggambar tanda centang. */
function garisTebal(GdImage $img, float $x1, float $y1, float $x2, float $y2, float $tebal, int $c): void
{
    $dx = $x2 - $x1;
    $dy = $y2 - $y1;
    $panjang = sqrt(($dx * $dx) + ($dy * $dy));

    if ($panjang < 0.01) {
        return;
    }

    $ox = (-$dy / $panjang) * ($tebal / 2);
    $oy = ($dx / $panjang) * ($tebal / 2);

    imagefilledpolygon($img, [
        (int) ($x1 + $ox), (int) ($y1 + $oy),
        (int) ($x2 + $ox), (int) ($y2 + $oy),
        (int) ($x2 - $ox), (int) ($y2 - $oy),
        (int) ($x1 - $ox), (int) ($y1 - $oy),
    ], $c);

    imagefilledellipse($img, (int) $x1, (int) $y1, (int) $tebal, (int) $tebal, $c);
    imagefilledellipse($img, (int) $x2, (int) $y2, (int) $tebal, (int) $tebal, $c);
}

/** Tanda centang yang benar benar berbentuk centang, bukan chevron. */
function centang(GdImage $img, float $cx, float $cy, float $ukuran, float $tebal, int $c): void
{
    $ax = $cx - ($ukuran * 0.46);
    $ay = $cy + ($ukuran * 0.02);
    $bx = $cx - ($ukuran * 0.13);
    $by = $cy + ($ukuran * 0.34);
    $dx = $cx + ($ukuran * 0.48);
    $dy = $cy - ($ukuran * 0.38);

    garisTebal($img, $ax, $ay, $bx, $by, $tebal, $c);
    garisTebal($img, $bx, $by, $dx, $dy, $tebal, $c);
}

/**
 * Tiga baris checklist: dua sudah dicentang, satu masih menunggu.
 * Ini isi yang sebenarnya dikerjakan aplikasi, bukan ikon hiasan.
 */
function gambarMarka(GdImage $img, float $x, float $y, float $s, bool $latarTerang = false): void
{
    $isi = warna($img, $latarTerang ? BRAND : PUTIH);
    $tunggu = warna($img, $latarTerang ? [0x9F, 0xB6, 0xBD] : REDUP);

    $tinggiBaris = $s * 0.075;
    $radius = $tinggiBaris / 2;
    $barX = $x + ($s * 0.06);
    $barW = $s * 0.42;
    $centangX = $x + ($s * 0.76);

    foreach ([[0.22, true], [0.50, true], [0.78, false]] as $i => [$posisi, $selesai]) {
        $barisY = $y + ($s * $posisi);
        $c = $selesai ? $isi : $tunggu;

        persegiBulat($img, $barX, $barisY - $radius, $barW, $tinggiBaris, $radius, $c);

        if ($selesai) {
            centang($img, $centangX, $barisY, $s * 0.26, $s * 0.085, $isi);
        } else {
            persegiBulat($img, $centangX - ($s * 0.11), $barisY - $radius, $s * 0.22, $tinggiBaris, $radius, $tunggu);
        }
    }
}

function simpan(GdImage $besar, int $ukuran, string $tujuan): void
{
    $kecil = kanvas($ukuran, $ukuran);
    imagealphablending($kecil, false);
    imagecopyresampled($kecil, $besar, 0, 0, 0, 0, $ukuran, $ukuran, imagesx($besar), imagesy($besar));
    imagesavealpha($kecil, true);
    imagepng($kecil, $tujuan, 9);
    echo '  '.str_pad(basename($tujuan), 26).number_format(filesize($tujuan))." byte\n";
}

/** @param array{int,int,int} $latar */
function ikon(int $ukuran, array $latar, float $paddingRasio, float $radiusRasio): GdImage
{
    $s = $ukuran * SKALA;
    $img = kanvas($s, $s);

    if ($radiusRasio > 0) {
        persegiBulat($img, 0, 0, $s - 1, $s - 1, $s * $radiusRasio, warna($img, $latar));
    } else {
        imagefilledrectangle($img, 0, 0, $s, $s, warna($img, $latar));
    }

    $isi = $s * (1 - (2 * $paddingRasio));
    gambarMarka($img, $s * $paddingRasio, $s * $paddingRasio, $isi);

    return $img;
}

echo "Ikon aplikasi\n";

$standar = ikon(512, BRAND, 0.20, 0.22);
simpan($standar, 512, PUBLIC_DIR.'/icons/icon-512.png');
simpan($standar, 192, PUBLIC_DIR.'/icons/icon-192.png');
simpan($standar, 180, PUBLIC_DIR.'/icons/apple-touch-icon.png');
simpan($standar, 32, PUBLIC_DIR.'/icons/favicon-32.png');

// Ikon maskable butuh ruang aman lebih lebar dan sudut penuh, karena Android
// memangkasnya jadi lingkaran atau bentuk lain sesuai peluncur.
$maskable = ikon(512, BRAND, 0.28, 0.0);
simpan($maskable, 512, PUBLIC_DIR.'/icons/maskable-512.png');

// favicon.ico berisi satu gambar PNG 32 piksel.
$png = file_get_contents(PUBLIC_DIR.'/icons/favicon-32.png');
$ico = pack('vvv', 0, 1, 1).pack('CCCCvvVV', 32, 32, 0, 0, 1, 32, strlen($png), 22).$png;
file_put_contents(PUBLIC_DIR.'/favicon.ico', $ico);
echo '  '.str_pad('favicon.ico', 26).number_format(strlen($ico))." byte\n";

echo "\nGambar pratinjau tautan\n";

$font = 'C:/Windows/Fonts/seguisb.ttf';
$fontReguler = 'C:/Windows/Fonts/segoeui.ttf';

if (! is_file($font)) {
    $font = $fontReguler = 'C:/Windows/Fonts/arialbd.ttf';
}

$W = 1200;
$H = 630;
$og = imagecreatetruecolor($W, $H);
imagefilledrectangle($og, 0, 0, $W, $H, warna($og, BRAND));
imagealphablending($og, true);

// Marka aplikasi, digambar besar lalu diperkecil supaya tepiannya halus.
$marka = ikon(120, BRAND, 0.02, 0.0);
imagecopyresampled($og, $marka, 72, 92, 0, 0, 120, 120, imagesx($marka), imagesy($marka));

imagettftext($og, 27, 0, 216, 148, warna($og, LEMBUT), $fontReguler, 'AREA HCA');
imagettftext($og, 20, 0, 216, 190, warna($og, REDUP), $fontReguler, 'Checklist maintenance dan infrastruktur');

imagettftext($og, 60, 0, 72, 330, warna($og, PUTIH), $font, 'Checklist Monitoring');
imagettftext($og, 60, 0, 72, 408, warna($og, PUTIH), $font, 'Maintenance');

imagettftext($og, 25, 0, 76, 470, warna($og, LEMBUT), $fontReguler,
    'Pencatatan per week dan per line, laporan Excel bulanan.');

imagettftext($og, 23, 0, 76, 545, warna($og, REDUP), $fontReguler, 'formmaintenance.krevostudio.com');

// Tiga warna status yang dipakai di seluruh aplikasi dan di laporan Excel.
$segmen = (int) ($W / 3);
foreach ([HIJAU, KUNING, MERAH] as $i => $c) {
    imagefilledrectangle($og, $i * $segmen, $H - 14, ($i + 1) * $segmen, $H, warna($og, $c));
}

imagepng($og, PUBLIC_DIR.'/og-image.png', 9);
echo '  '.str_pad('og-image.png', 26).number_format(filesize(PUBLIC_DIR.'/og-image.png'))." byte\n";

echo "\nSelesai.\n";
