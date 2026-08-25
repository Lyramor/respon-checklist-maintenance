# Checklist Monitoring Maintenance

Aplikasi web untuk mengganti Google Form checklist monitoring saat maintenance dan infrastruktur
di area HCA. Responden mengisi checklist lewat web, admin memantau isian, mengelola akun, dan
mengunduh laporan bulanan dalam format Excel yang sama persis dengan template yang sudah dipakai tim.

## Stack

| Bagian | Teknologi |
| --- | --- |
| Backend | Laravel 13, PHP 8.5 |
| Frontend | Inertia 3, React 19, TypeScript, Tailwind CSS 4 |
| Database | PostgreSQL 14 |
| Excel | PhpSpreadsheet |
| PWA | vite-plugin-pwa (installable, offline shell) |

Tanpa Filament dan tanpa starter kit. Seluruh panel admin, autentikasi, dan design system
dibangun sendiri.

## Struktur

Backend memakai pemisahan domain (DDD ringan). Controller tipis, logika ada di service.

```
app/
  Domain/
    Checklist/     Support/ChecklistBlueprint.php  <- sumber kebenaran 31 item checklist
                   Models/ChecklistSubmission.php
                   Services/ChecklistService.php
    Identity/      Models/User.php, Services/UserService.php
    Activity/      Models/ActivityLog.php, Services/ActivityLogger.php
    Notification/  Notifications/*, Services/AdminNotifier.php
    Reporting/     Models/ReportExport.php, Services/MonthlyReportService.php
                   Services/MonthlyReportWriter.php  <- penulis file .xlsx
  Http/
    Controllers/   Auth, Checklist, Dashboard, Admin
    Requests/      validasi, aturannya dibangun dari ChecklistBlueprint
    Middleware/    HandleInertiaRequests, EnsureAdmin
```

Frontend mengikuti pelapisan layout, page, component. Page hanya menyusun section.

```
resources/js/
  layouts/     auth-layout.tsx, app-layout.tsx
  pages/       auth/, checklist/, admin/, dashboard.tsx, error.tsx
  components/  ui/ (primitive), shell/, checklist/, admin/, dashboard/
  types/       cerminan 1:1 bentuk data dari backend
  routes/      peta rute bertipe, tidak ada URL yang ditulis manual di komponen
```

`ChecklistBlueprint.php` adalah satu satunya tempat isi checklist didefinisikan. Form React,
aturan validasi, dan penulis Excel semuanya membaca dari sana, jadi ketiganya tidak mungkin
berbeda isi maupun urutan.

## Menjalankan

Prasyarat: PHP 8.5 dengan ekstensi `pdo_pgsql`, `gd`, `zip`, `mbstring`; Composer 2; Node 20 ke atas;
PostgreSQL yang jalan.

```bash
composer install
npm install

cp .env.example .env
php artisan key:generate
```

Sesuaikan bagian database di `.env`:

```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=checklist_maintenance
DB_USERNAME=postgres
DB_PASSWORD=password
```

Buat databasenya, lalu:

```bash
php artisan migrate --seed
npm run build          # atau: npm run dev
php artisan serve
```

Buka http://localhost:8000

## Akun bawaan

Dibuat oleh seeder. Semua kata sandinya `password`.

| Peran | Username | Keterangan |
| --- | --- | --- |
| Admin | `admin` | Akses penuh |
| Responden | `responden` | Akun kosong tanpa isian |
| Responden | `agus_line1` | Petugas Line 1 |
| Responden | `dewi_line2` | Petugas Line 2 |
| Responden | `rizky_line3` | Petugas Line 3 |
| Responden | `siti_line5` | Petugas Line 5 |

Login menerima username maupun email. Ganti kata sandi admin sebelum dipakai di lingkungan nyata.

## Data contoh

`RespondenChecklistSeeder` mengisi satu bulan berjalan secara penuh: empat petugas, satu orang
memegang satu line, masing masing mengisi kelima minggu. Hasilnya 20 slot terisi, sama dengan
jumlah kolom pada sheet Excel bulanan, jadi dashboard admin langsung menampilkan cakupan 100 persen
dan laporan yang diekspor terisi penuh.

Sebagian besar jawaban berada pada kondisi sesuai standar, dengan beberapa temuan kuning dan merah
yang sengaja ditanam supaya pewarnaan pada laporan dan halaman detail ikut terlihat. Seeder ini aman
dijalankan berulang kali karena isian milik keempat petugas pada periode tersebut dihapus dulu
sebelum dibuat ulang.

```bash
php artisan db:seed                                   # semua akun plus data sebulan
php artisan db:seed --class=RespondenChecklistSeeder  # hanya data checklistnya
```

## Peran

**Responden** hanya bisa mengisi checklist dan melihat riwayat isiannya sendiri.

**Admin** bisa semua yang responden bisa, ditambah: melihat seluruh isian, membuat dan menghapus
akun, membaca log aktivitas, menerima notifikasi setiap ada isian baru, dan mengekspor laporan
bulanan.

## Laporan Excel

Di halaman laporan, admin memilih tahun dan bulan lalu menekan export. File hasilnya tersimpan di
riwayat pada halaman yang sama, bisa diunduh ulang atau dihapus. Isi filenya: satu sheet untuk satu
bulan, grid 5 week kali 4 line (Line 1, 2, 3, 5), Nama Petugas dan Tanggal Pemeriksaan per line,
dropdown pada setiap item opsi, pewarnaan otomatis hijau, kuning, merah, dan keterangan warna di
bagian bawah. Kalau satu week dan line diisi lebih dari sekali, yang dipakai adalah isian terbaru.

Bulan yang belum ada isiannya tetap bisa diekspor dan menghasilkan template kosong.

## Pengujian

```bash
php artisan test
```

## Kredit

Dibuat oleh [krevostudio.com](https://krevostudio.com)
