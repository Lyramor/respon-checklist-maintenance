# Panduan Hosting

Panduan memasang aplikasi ini di server produksi pada domain
**`formmaintenance.krevostudio.com`**, dengan syarat tidak mengganggu domain lain
yang sudah berjalan di server yang sama.

| Item | Nilai |
| --- | --- |
| Domain | `formmaintenance.krevostudio.com` |
| IP origin | lihat dashboard Cloudflare, sengaja tidak ditulis di sini |
| DNS | Cloudflare, record `A`, status **Proxied** (awan oranye) |
| Zona waktu | `Asia/Jakarta` (WIB) |
| Direktori | `/var/www/formmaintenance` |
| Pengguna sistem | `formmaint` |
| Database | PostgreSQL, `checklist_maintenance` |

## Asumsi

Panduan ini ditulis untuk **Ubuntu 22.04 atau 24.04 dengan nginx, PHP-FPM 8.3 ke atas,
dan PostgreSQL 14 ke atas**, dipasang langsung lewat SSH.

Kalau server memakai panel (aaPanel, cPanel, Plesk, CloudPanel), langkah 1 sampai 8 bisa
diganti dengan membuat website baru dari panel tersebut. Yang tidak boleh dilewat adalah
**Langkah 9 tentang pemisahan antar domain** dan **Langkah 10 tentang Cloudflare**, karena
dua hal itulah yang menentukan aplikasi ini tidak bentrok dan tidak salah baca IP pengunjung.

---

## Prasyarat

```bash
sudo apt update
sudo apt install -y nginx postgresql redis-server unzip git curl \
    php8.3-fpm php8.3-cli php8.3-pgsql php8.3-mbstring php8.3-xml \
    php8.3-zip php8.3-gd php8.3-curl php8.3-intl php8.3-bcmath
```

Ekstensi PHP yang wajib ada: `pdo_pgsql`, `mbstring`, `xml`, `zip`, `gd`, `curl`, `intl`,
`bcmath`, `openssl`, `fileinfo`. `zip` dan `gd` dipakai oleh pembuat laporan Excel, jadi
kalau keduanya tidak aktif fitur export akan gagal.

Composer dan Node:

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

Cek versi:

```bash
php -v          # minimal 8.3
composer -V     # minimal 2.7
node -v         # minimal 20
psql --version  # minimal 14
```

---

## Langkah 1. Pengguna sistem dan direktori sendiri

Aplikasi ini tidak boleh berbagi pengguna sistem dengan website lain. Kalau berbagi, satu
website yang jebol bisa membaca dan mengubah file website lain, termasuk file `.env` yang
berisi kata sandi database.

```bash
sudo adduser --system --group --home /var/www/formmaintenance --shell /usr/sbin/nologin formmaint
sudo mkdir -p /var/www/formmaintenance
sudo chown formmaint:formmaint /var/www/formmaintenance
```

---

## Langkah 2. Database dan pengguna database sendiri

Jangan memakai pengguna `postgres` untuk aplikasi. Buat pengguna khusus yang hanya punya
akses ke satu database.

```bash
sudo -u postgres psql
```

```sql
CREATE ROLE formmaint_app WITH LOGIN PASSWORD 'ganti-dengan-kata-sandi-panjang';
CREATE DATABASE checklist_maintenance OWNER formmaint_app ENCODING 'UTF8';
\c checklist_maintenance
GRANT ALL ON SCHEMA public TO formmaint_app;
ALTER DATABASE checklist_maintenance SET timezone TO 'Asia/Jakarta';
\q
```

Uji koneksinya sebelum lanjut:

```bash
PGPASSWORD='kata-sandi-tadi' psql -U formmaint_app -h 127.0.0.1 -d checklist_maintenance -c 'SELECT now();'
```

---

## Langkah 3. Ambil kode dan pasang dependensi

```bash
sudo -u formmaint git clone https://github.com/Lyramor/respon-checklist-maintenance.git /var/www/formmaintenance
cd /var/www/formmaintenance

sudo -u formmaint composer install --no-dev --optimize-autoloader --no-interaction
sudo -u formmaint npm ci
sudo -u formmaint npm run build
```

`npm run build` wajib dijalankan di server. Tanpa itu tidak ada file di `public/build`,
halaman akan blank, dan manifest PWA tidak akan tersalin ke `public/manifest.webmanifest`.

Node hanya dibutuhkan saat build. Setelah selesai, `node_modules` boleh dihapus untuk
menghemat ruang, tapi harus dipasang lagi setiap kali ada perubahan tampilan.

---

## Langkah 4. Berkas `.env`

```bash
sudo -u formmaint cp .env.example .env
sudo -u formmaint php artisan key:generate
sudo -u formmaint nano .env
```

Isi seperti ini:

```dotenv
APP_NAME="Checklist Monitoring Maintenance"
APP_ENV=production
APP_KEY=                       # sudah diisi otomatis oleh key:generate
APP_DEBUG=false
APP_TIMEZONE=Asia/Jakarta
APP_URL=https://formmaintenance.krevostudio.com

LOG_CHANNEL=daily
LOG_LEVEL=warning

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=checklist_maintenance
DB_USERNAME=formmaint_app
DB_PASSWORD=kata-sandi-dari-langkah-2

SESSION_DRIVER=database
SESSION_LIFETIME=480
SESSION_COOKIE=formmaint_session
SESSION_DOMAIN=formmaintenance.krevostudio.com
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

CACHE_STORE=database
CACHE_PREFIX=formmaint_
QUEUE_CONNECTION=sync
```

Tiga baris yang paling menentukan aplikasi ini tidak bentrok dengan domain lain:

- **`APP_DEBUG=false`.** Kalau `true`, halaman error akan membocorkan isi `.env` termasuk
  kata sandi database ke siapa pun yang membuka situs.
- **`SESSION_COOKIE=formmaint_session`.** Nama cookie harus unik. Kalau ada aplikasi lain
  di `krevostudio.com` yang memakai nama cookie sama, sesi login keduanya akan saling
  menimpa dan pengguna akan terlempar keluar sendiri.
- **`SESSION_DOMAIN=formmaintenance.krevostudio.com`.** Harus subdomain lengkap, jangan
  ditulis `.krevostudio.com`. Kalau ditulis dengan titik di depan, cookie ikut terkirim ke
  semua subdomain lain dan menimbulkan bentrok yang persis sama.

Kalau server memakai Redis bersama-sama dengan aplikasi lain, `CACHE_PREFIX` juga wajib
unik supaya cache antar aplikasi tidak saling menimpa.

---

## Langkah 5. Migrasi dan akun awal

```bash
cd /var/www/formmaintenance
sudo -u formmaint php artisan migrate --force
sudo -u formmaint php artisan db:seed --force
sudo -u formmaint php artisan storage:link
```

Seeder membuat akun berikut, semuanya berkata sandi `password`:

| Peran | Username |
| --- | --- |
| Admin | `admin` |
| Responden | `responden`, `agus_line1`, `dewi_line2`, `rizky_line3`, `siti_line5` |

Seeder juga mengisi satu bulan penuh sebagai data contoh.

> **Wajib dilakukan di produksi.** Segera masuk sebagai `admin` lalu ganti kata sandinya.
> Kalau data contoh tidak diinginkan, jalankan `php artisan migrate:fresh --force` lalu
> buat akun admin secara manual lewat `php artisan tinker`, bukan lewat seeder.

---

## Langkah 6. Hak akses berkas

```bash
cd /var/www/formmaintenance
sudo chown -R formmaint:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
sudo chmod 640 .env
sudo chown formmaint:formmaint .env
```

Direktori `storage/app/reports` dibuat otomatis saat export laporan pertama kali. Isinya
tidak boleh bisa diakses langsung dari web, dan memang tidak bisa karena berada di luar
`public`. Unduhan laporan selalu lewat rute yang mengecek login dan peran admin dulu.

---

## Langkah 7. Optimasi produksi

```bash
cd /var/www/formmaintenance
sudo -u formmaint php artisan config:cache
sudo -u formmaint php artisan route:cache
sudo -u formmaint php artisan view:cache
sudo -u formmaint php artisan event:cache
```

Setiap kali `.env` diubah, jalankan ulang `php artisan config:cache`, karena setelah
di-cache Laravel berhenti membaca `.env` secara langsung.

---

## Langkah 8. Pool PHP-FPM sendiri

Pool terpisah membuat aplikasi ini berjalan sebagai penggunanya sendiri dan punya jatah
proses sendiri. Kalau memakai pool `www` bawaan bersama domain lain, satu aplikasi yang
sibuk bisa menghabiskan seluruh proses dan menjatuhkan semua situs di server itu.

Buat `/etc/php/8.3/fpm/pool.d/formmaintenance.conf`:

```ini
[formmaintenance]
user = formmaint
group = formmaint
listen = /run/php/php8.3-fpm-formmaintenance.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660

pm = dynamic
pm.max_children = 12
pm.start_servers = 3
pm.min_spare_servers = 2
pm.max_spare_servers = 5
pm.max_requests = 500

php_admin_value[error_log] = /var/log/php-fpm/formmaintenance-error.log
php_admin_flag[log_errors] = on
php_admin_value[date.timezone] = Asia/Jakarta
php_admin_value[memory_limit] = 256M
php_admin_value[upload_max_filesize] = 8M
php_admin_value[post_max_size] = 12M
php_admin_value[max_execution_time] = 120
php_admin_value[open_basedir] = /var/www/formmaintenance:/tmp:/usr/share/php
```

`open_basedir` mengunci aplikasi supaya tidak bisa membaca direktori website lain sama
sekali, meskipun ada celah keamanan di kodenya.

`max_execution_time` sengaja 120 detik karena pembuatan file Excel satu bulan penuh
memerlukan waktu lebih lama daripada permintaan halaman biasa.

```bash
sudo mkdir -p /var/log/php-fpm
sudo php-fpm8.3 -t
sudo systemctl restart php8.3-fpm
```

---

## Langkah 9. nginx, bagian yang menentukan tidak bentrok

### 9a. Blok penangkap bawaan

Ini langkah paling penting supaya domain lain tidak saling tertukar. Tanpa blok ini,
permintaan dengan nama host yang tidak dikenali akan jatuh ke server block pertama yang
kebetulan terbaca nginx, sehingga pengunjung bisa melihat situs yang salah.

Buat `/etc/nginx/sites-available/000-default-catchall`:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;

    server_name _;

    ssl_certificate     /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;

    # Menolak tanpa jawaban. Domain yang tidak terdaftar tidak akan pernah
    # menampilkan isi website mana pun.
    return 444;
}
```

Pastikan **tidak ada** server block lain yang memakai `default_server`:

```bash
grep -rn "default_server" /etc/nginx/sites-enabled/
```

Kalau ada yang lain, hapus kata `default_server` dari blok tersebut.

### 9b. Membaca IP asli dari Cloudflare

Karena semua trafik lewat Cloudflare, tanpa pengaturan ini setiap pengunjung akan tercatat
sebagai IP milik Cloudflare. Log aktivitas di halaman admin jadi tidak berguna, dan
pembatasan percobaan login akan menghitung seluruh dunia sebagai satu orang.

Buat `/etc/nginx/conf.d/cloudflare-realip.conf`:

```nginx
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;
set_real_ip_from 2400:cb00::/32;
set_real_ip_from 2606:4700::/32;
set_real_ip_from 2803:f800::/32;
set_real_ip_from 2405:b500::/32;
set_real_ip_from 2405:8100::/32;
set_real_ip_from 2a06:98c0::/29;
set_real_ip_from 2c0f:f248::/32;

real_ip_header CF-Connecting-IP;
```

Daftar ini bisa berubah. Sumber resminya ada di
<https://www.cloudflare.com/ips/>, sebaiknya diperiksa ulang sekitar setahun sekali.

### 9c. Server block aplikasi

Buat `/etc/nginx/sites-available/formmaintenance.krevostudio.com`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name formmaintenance.krevostudio.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;

    # Hanya nama ini. Jangan pernah ditambah default_server.
    server_name formmaintenance.krevostudio.com;

    root /var/www/formmaintenance/public;
    index index.php;

    # Sertifikat Origin dari Cloudflare, lihat Langkah 10b.
    ssl_certificate     /etc/ssl/cloudflare/formmaintenance.pem;
    ssl_certificate_key /etc/ssl/cloudflare/formmaintenance.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    charset utf-8;
    client_max_body_size 12M;

    # Log terpisah supaya tidak tercampur dengan domain lain.
    access_log /var/log/nginx/formmaintenance-access.log;
    error_log  /var/log/nginx/formmaintenance-error.log warn;

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm-formmaintenance.sock;
        fastcgi_param HTTPS on;
        fastcgi_read_timeout 120s;
    }

    # Service worker tidak boleh disimpan lama, kalau tidak pengguna akan
    # tertahan di versi lama aplikasi setelah pembaruan.
    location = /sw.js {
        add_header Cache-Control "no-cache, must-revalidate" always;
    }

    location = /manifest.webmanifest {
        add_header Cache-Control "no-cache" always;
        types { } default_type application/manifest+json;
    }

    # Berkas hasil build sudah bernama unik, jadi aman disimpan lama.
    location /build/ {
        access_log off;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(png|jpg|jpeg|svg|ico|webp|woff2)$ {
        access_log off;
        expires 30d;
        add_header Cache-Control "public";
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    error_page 404 /index.php;
}
```

Aktifkan dan uji:

```bash
sudo ln -s /etc/nginx/sites-available/formmaintenance.krevostudio.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/000-default-catchall /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Langkah 10. Cloudflare

### 10a. DNS

Record sudah ada dan sudah benar:

| Type | Name | Content | Proxy |
| --- | --- | --- | --- |
| A | `formmaintenance` | IP origin server | Proxied |

Biarkan tetap **Proxied**. Status inilah yang membuat IP server tidak terlihat publik.

> IP origin sengaja tidak dicantumkan di berkas ini karena repositorinya publik. Menuliskan
> IP origin di tempat yang bisa dibaca umum membatalkan perlindungan Cloudflare, sebab
> penyerang bisa menghubungi server secara langsung tanpa melewati Cloudflare sama sekali,
> dan itu ikut membahayakan domain lain di server yang sama. Nilainya bisa dilihat kapan
> saja di dashboard Cloudflare pada menu DNS.

### 10b. Sertifikat Origin

Di dashboard Cloudflare, buka **SSL/TLS** lalu **Origin Server**, tekan
**Create Certificate**, isi hostname `formmaintenance.krevostudio.com`, lalu simpan dua
berkas hasilnya di server:

```bash
sudo mkdir -p /etc/ssl/cloudflare
sudo nano /etc/ssl/cloudflare/formmaintenance.pem   # tempel Origin Certificate
sudo nano /etc/ssl/cloudflare/formmaintenance.key   # tempel Private Key
sudo chmod 600 /etc/ssl/cloudflare/formmaintenance.key
sudo systemctl reload nginx
```

Lalu di **SSL/TLS** bagian **Overview**, pilih mode **Full (strict)**. Jangan memilih
**Flexible**, karena mode itu membuat Cloudflare menghubungi server lewat http biasa
sehingga kata sandi pengguna melintas tanpa enkripsi di dalam jaringan.

Di **SSL/TLS** bagian **Edge Certificates**, aktifkan **Always Use HTTPS**.

### 10c. Firewall origin

Ini yang membuat pengaturan trusted proxy di aplikasi aman. Selama hanya Cloudflare yang
bisa menghubungi port web, tidak ada yang bisa memalsukan header IP pengunjung.

```bash
sudo ufw allow 22/tcp
for ip in $(curl -s https://www.cloudflare.com/ips-v4) $(curl -s https://www.cloudflare.com/ips-v6); do
    sudo ufw allow from $ip to any port 80,443 proto tcp
done
sudo ufw enable
sudo ufw status numbered
```

Kalau server ini juga melayani domain lain yang **tidak** lewat Cloudflare, jangan pakai
perintah di atas apa adanya karena akan memutus domain tersebut. Untuk kasus itu, biarkan
port 80 dan 443 terbuka, dan cukup andalkan blok `return 444` dari Langkah 9a.

### 10d. Aturan cache

Halaman aplikasi ini selalu bergantung pada siapa yang sedang login, jadi tidak boleh
disimpan Cloudflare. Kalau tersimpan, isian milik satu petugas bisa terlihat oleh petugas
lain.

Buka **Caching** lalu **Cache Rules**, buat aturan baru:

- Nama: `Formmaintenance tanpa cache HTML`
- Kondisi: `Hostname equals formmaintenance.krevostudio.com` **and**
  `URI Path does not start with /build/`
- Aksi: **Bypass cache**

Berkas di `/build/` boleh tetap di-cache karena namanya sudah mengandung hash unik setiap
kali dibangun ulang.

Di **Speed** lalu **Optimization**, **matikan Rocket Loader** untuk hostname ini. Rocket
Loader mengubah urutan pemuatan JavaScript dan kerap membuat aplikasi berbasis React gagal
tampil.

### 10e. Uji tampilan tautan saat dibagikan

Setelah situs hidup, periksa pratinjaunya:

- <https://developers.facebook.com/tools/debug/> untuk WhatsApp dan Facebook
- <https://cards-dev.twitter.com/validator> untuk X

Masukkan `https://formmaintenance.krevostudio.com/login`. Hasil yang benar menampilkan
judul, satu kalimat penjelasan, dan gambar biru tua berisi tulisan Checklist Monitoring
Maintenance.

Gambarnya ada di `public/og-image.png`. Kalau isinya perlu diubah, sunting
`scripts/generate-brand-assets.php` lalu jalankan:

```bash
php scripts/generate-brand-assets.php
```

Skrip yang sama juga membuat ulang favicon dan seluruh ikon PWA, jadi ikon di tab browser
dan di layar utama ponsel tetap seragam. Perlu diingat, WhatsApp dan Facebook menyimpan
pratinjau cukup lama, jadi setelah gambar diganti pratinjaunya harus disegarkan lewat
Facebook Debugger.

---

## Langkah 11. Zona waktu WIB

Aplikasi sudah diatur `Asia/Jakarta` lewat `APP_TIMEZONE`. Supaya seluruh lapisan seragam
dan tidak ada selisih tujuh jam pada tanggal pemeriksaan maupun log aktivitas, samakan
juga sistem dan database.

```bash
sudo timedatectl set-timezone Asia/Jakarta
timedatectl                       # pastikan tertulis WIB, +0700
```

PHP untuk baris perintah dan untuk web:

```bash
sudo sed -i 's|^;*date.timezone.*|date.timezone = Asia/Jakarta|' /etc/php/8.3/cli/php.ini
sudo sed -i 's|^;*date.timezone.*|date.timezone = Asia/Jakarta|' /etc/php/8.3/fpm/php.ini
sudo systemctl restart php8.3-fpm
```

PostgreSQL sudah diatur per database pada Langkah 2. Untuk memastikan:

```bash
sudo -u postgres psql -d checklist_maintenance -c 'SHOW timezone;'
```

Verifikasi akhir dari sisi aplikasi:

```bash
cd /var/www/formmaintenance
sudo -u formmaint php artisan tinker --execute="echo config('app.timezone').' | '.now()->format('d/m/Y H:i');"
```

Jamnya harus sama dengan jam dinding di Indonesia bagian barat.

---

## Langkah 12. Tugas terjadwal

Aplikasi ini belum memakai antrian, jadi Supervisor tidak diperlukan. Yang berguna adalah
pembersihan berkas laporan lama supaya disk tidak penuh, karena setiap export menyimpan
satu berkas di `storage/app/reports`.

```bash
sudo crontab -u formmaint -e
```

```cron
# Hapus berkas laporan yang lebih tua dari 90 hari, setiap hari pukul 02:00 WIB.
0 2 * * * find /var/www/formmaintenance/storage/app/reports -type f -mtime +90 -delete
```

Berkas yang dihapus cron masih akan terlihat di daftar riwayat halaman laporan, dan saat
ditekan unduh akan muncul pesan bahwa berkasnya sudah tidak ada di server dan perlu
diexport ulang. Ini memang perilaku yang diharapkan.

---

## Verifikasi setelah pemasangan

Jalankan seluruhnya dan pastikan hasilnya sesuai:

```bash
# 1. Halaman login terbuka lewat https
curl -sI https://formmaintenance.krevostudio.com/login | head -1
# harapkan: HTTP/2 200

# 2. http dialihkan ke https
curl -sI http://formmaintenance.krevostudio.com/login | head -1
# harapkan: HTTP/1.1 301

# 3. Aset PWA dan ikon tersaji
for u in /manifest.webmanifest /sw.js /favicon.ico /og-image.png /icons/icon-192.png; do
    printf '%-26s %s\n' "$u" "$(curl -s -o /dev/null -w '%{http_code}' https://formmaintenance.krevostudio.com$u)"
done
# semuanya harapkan: 200

# 4. Meta pratinjau tautan terbaca
curl -s https://formmaintenance.krevostudio.com/login | grep -c 'og:image'
# harapkan: 1

# 5. Alamat di meta memakai https, bukan http
curl -s https://formmaintenance.krevostudio.com/login | grep 'og:url'
# harapkan mengandung https://

# 6. Berkas rahasia tidak bisa diakses
curl -s -o /dev/null -w '%{http_code}\n' https://formmaintenance.krevostudio.com/.env
# harapkan: 404 atau 403, jangan sampai 200

# 7. Domain lain di server ini tidak terpengaruh
curl -sI https://domain-lain-anda.com | head -1
# harapkan tetap seperti sebelum pemasangan
```

Lalu lewat browser:

- Masuk sebagai `admin`, pastikan dashboard menampilkan cakupan bulan berjalan
- Buka halaman Laporan, export satu bulan, unduh berkasnya, pastikan terbuka di Excel
- Buka di ponsel, pastikan muncul tawaran **Tambahkan ke layar utama** dan ikonnya adalah
  ikon checklist berwarna biru tua, bukan ikon Laravel
- Kirim tautannya lewat WhatsApp ke diri sendiri, pastikan muncul gambar pratinjau
- Periksa halaman Log Aktivitas, kolom IP harus berisi IP asli pengguna, bukan IP
  Cloudflare seperti `172.68.x.x`

---

## Memperbarui ke versi baru

```bash
cd /var/www/formmaintenance
sudo -u formmaint php artisan down --render="errors::503"

sudo -u formmaint git pull origin main
sudo -u formmaint composer install --no-dev --optimize-autoloader --no-interaction
sudo -u formmaint npm ci
sudo -u formmaint npm run build
sudo -u formmaint php artisan migrate --force

sudo -u formmaint php artisan optimize:clear
sudo -u formmaint php artisan config:cache
sudo -u formmaint php artisan route:cache
sudo -u formmaint php artisan view:cache

sudo systemctl reload php8.3-fpm
sudo -u formmaint php artisan up
```

Setelah pembaruan tampilan, pengguna yang sudah memasang aplikasi sebagai PWA akan
menerima versi baru otomatis karena service worker memakai mode `autoUpdate`. Kalau ada
yang mengaku masih melihat versi lama, minta mereka menutup semua tab aplikasi lalu
membukanya kembali.

---

## Cadangan data

```bash
sudo mkdir -p /var/backups/formmaintenance
sudo crontab -e
```

```cron
# Cadangan database setiap hari pukul 01:00 WIB, disimpan 14 hari terakhir.
0 1 * * * PGPASSWORD='kata-sandi' pg_dump -U formmaint_app -h 127.0.0.1 checklist_maintenance | gzip > /var/backups/formmaintenance/db-$(date +\%F).sql.gz
30 1 * * * find /var/backups/formmaintenance -name 'db-*.sql.gz' -mtime +14 -delete
```

Yang wajib ikut dicadangkan di luar database: berkas `.env`, karena berisi `APP_KEY`.
Tanpa `APP_KEY` yang sama, seluruh sesi dan data terenkripsi tidak bisa dibaca lagi.

Memulihkan:

```bash
gunzip -c /var/backups/formmaintenance/db-2026-08-25.sql.gz | \
    PGPASSWORD='kata-sandi' psql -U formmaint_app -h 127.0.0.1 checklist_maintenance
```

---

## Bila ada masalah

| Gejala | Penyebab yang paling sering | Tindakan |
| --- | --- | --- |
| Halaman putih kosong | `npm run build` belum dijalankan di server | Jalankan `npm ci && npm run build`, lalu `php artisan view:cache` |
| Muncul situs milik domain lain | Ada server block lain memakai `default_server` | Kerjakan Langkah 9a |
| Redirect berputar terus | Mode SSL Cloudflare masih **Flexible** | Ganti ke **Full (strict)**, Langkah 10b |
| Tautan di halaman memakai `http://` | Trusted proxy atau `APP_URL` belum benar | Pastikan `APP_URL` memakai https, lalu `php artisan config:cache` |
| Log aktivitas berisi IP Cloudflare | `cloudflare-realip.conf` belum aktif | Kerjakan Langkah 9b, lalu `nginx -t` dan reload |
| Jam tampil selisih tujuh jam | Zona waktu belum seragam | Kerjakan Langkah 11 seluruhnya |
| Export Excel gagal atau timeout | Ekstensi `zip` atau `gd` mati, atau batas waktu terlalu pendek | Pasang ekstensinya, naikkan `max_execution_time` dan `fastcgi_read_timeout` |
| Pratinjau WhatsApp masih gambar lama | Pratinjau tersimpan di sisi WhatsApp | Segarkan lewat Facebook Debugger, Langkah 10e |
| Pengguna terlempar keluar sendiri | Nama cookie sesi bentrok dengan aplikasi lain | Pastikan `SESSION_COOKIE` dan `SESSION_DOMAIN` seperti Langkah 4 |
| Gagal tulis di `storage` | Kepemilikan berkas salah | Ulangi Langkah 6 |

Berkas log yang perlu dilihat lebih dulu:

```bash
tail -n 100 /var/www/formmaintenance/storage/logs/laravel-$(date +%F).log
tail -n 100 /var/log/nginx/formmaintenance-error.log
tail -n 100 /var/log/php-fpm/formmaintenance-error.log
```

---

## Ringkasan pemisahan antar domain

Bagian ini yang menjawab syarat tidak boleh bentrok dengan domain lain di server yang sama.

| Aspek | Milik aplikasi ini | Kenapa harus terpisah |
| --- | --- | --- |
| Pengguna sistem | `formmaint` | Website lain tidak bisa membaca `.env` aplikasi ini |
| Direktori | `/var/www/formmaintenance` | Dikunci lagi lewat `open_basedir` |
| Pool PHP-FPM | `formmaintenance` | Lonjakan trafik di sini tidak menjatuhkan situs lain |
| Socket PHP | `php8.3-fpm-formmaintenance.sock` | Tidak berebut dengan pool `www` |
| Database dan rolenya | `checklist_maintenance`, `formmaint_app` | Tidak bisa menyentuh database lain |
| Nama cookie sesi | `formmaint_session` | Sesi login tidak saling menimpa |
| Domain cookie | subdomain lengkap | Cookie tidak bocor ke subdomain lain |
| Awalan cache | `formmaint_` | Aman meski Redis dipakai bersama |
| Berkas log | `formmaintenance-*.log` | Penelusuran masalah tidak tercampur |
| server_name nginx | satu nama, tanpa `default_server` | Domain tidak pernah saling tertukar |

---

Dibuat oleh [krevostudio.com](https://krevostudio.com)
