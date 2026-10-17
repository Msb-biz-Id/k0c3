# Koceevent - Tournament & Sports Management Platform

[![Laravel Tests](https://img.shields.io/badge/PHPUnit%20Tests-96%20Passed-brightgreen)](file:///d:/Titip/padelgigs/tests)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-v2%20React%2019-6366f1)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06b6d4)](https://tailwindcss.com)

**Koceevent** adalah platform operasional turnamen olahraga dan portal publik atlet terlengkap di Indonesia. Platform ini dirancang khusus untuk Event Organizer (EO), wasit lapangan (*referee*), pemain (*athletes*), dan Superadmin dengan antarmuka modern bernuansa *dark glassmorphism* (`bg-slate-950`), animasi GPU terakselerasi (`motion/react` v12), dynamic theme customizer, dan 100% vector icons (Lucide React, tanpa unicode emoji).

---

## 🚀 Fitur Unggulan Sistem

### 1. Superadmin Master Data Dinamis & Snapshot Protection
- **Dynamic CRUD Master Tiers, Divisions, & Skill Levels**: Tambah, ubah, urutkan (*batch reorder*), nonaktifkan, dan hapus dengan proteksi `SoftDeletes`.
- **Snapshot Data Protection**: Setiap pendaftaran kategori turnamen menyimpan snapshot nama tier/divisi/skill secara permanen pada tabel `tournament_categories`. Perubahan master data Superadmin di masa depan tidak akan merusak turnamen historis.
- **Sistem Impersonasi EO**: Superadmin dapat mengasumsikan peran EO manapun dengan satu klik untuk investigasi dan pendampingan teknis tanpa meminta password, lengkap dengan banner kembali ke Superadmin.

### 2. Event Organizer (EO) Hub & Tournament Builder
- **Multi-Image Showcase Gallery**: Upload hingga 10 foto poster turnamen dengan fitur bintang untuk memilih featured banner utama.
- **Dataset Wilayah Resmi Kemendagri BPS**: Dropdown cascading 38 Provinsi & 514 Kota/Kabupaten Indonesia secara offline dan tersimpan di cache.
- **Dynamic Category Repeater**: Konfigurasi multi-kategori tanding dalam 1 turnamen dengan format round-robin, knockout, atau grup + knockout.

### 3. Match Engine & Algoritma Turnamen
- **Undian Seimbang (Balanced Draw) & Seeding Isolation**: Fisher-Yates shuffle yang memisahkan Unggulan 1 (Grup A) dan Unggulan 2 (Grup B) agar tidak bentrok di babak awal.
- **Generator Fixture Round-Robin Berger (Circle Method)**: Penjadwalan putaran grup otomatis tanpa konflik jam tanding.
- **Standings 6-Tingkat Tie-Breaker Deterministik**:
  `Poin` ➔ `Head-to-Head` ➔ `Game Difference` ➔ `Games Won` ➔ `Fewest Games Lost` ➔ `Alfabetis`.
- **Bagan Pohon Biner Knockout**: Cross-group knockout (Juara Grup A vs Runner-up B, dsb.), Final, dan perebutan Juara 3 dengan konektor visual SVG.

### 4. Tournament Desk & Wasit Lapangan
- **Court Control Monitor**: Grid status lapangan kontras tinggi (*Vacant* vs *Ongoing*), antrean pertandingan (*match queue*), dan penugasan lapangan 1-klik.
- **Web Scoring Wasit Berbasis Token (`/referee/{token}`)**:
  - Akses instan wasit mobile tanpa perlu registrasi/login akun.
  - Touch pad 44px+ mobile-first (Skor Padel: 0, 15, 30, 40, Golden Point), Serve toggle, dan Game counter.
  - **Pessimistic Locking Database (`lockForUpdate()`)**: Mencegah race condition saat wasit mengklik skor berurutan secara cepat.
  - Efek konfeti kemenangan (`canvas-confetti`) saat match selesai.
- **Meja Registrasi & Presensi Check-In**: Toggle kehadiran instan atlet (`is_checked_in`) dan verifikasi pembayaran.
- **Official Match Sheet PDF**: Generator lembar skor resmi berstandar A4 via DomPDF siap cetak.

### 5. Portal Publik & Mode TV Kiosk
- **Beranda Publik & Live Stadium Radar Ticker**: Running ticker skor bola padel bergerak dinamis, filter wilayah provinsi, dan kartu Hall of Fame atlet.
- **Pusat Single Turnamen 6-Tab**: `LIVE SCORE`, `ORDER OF PLAY`, `RESULTS`, `LEADERBOARD`, `BRACKET`, dan `INFO & PANDUAN`.
- **Mode TV Kiosk Fullscreen 16:9 (`/tournaments/{slug}/slideshow`)**: Rotasi otomatis 10 detik antar-slide (Live Matches, Upcoming Matches, Leaderboard) ideal untuk TV display venue padel.
- **Mobile PWA Experience**: Bottom navigation bar menempel di dasar layar smartphone dengan dukungan safe-area inset (`env(safe-area-inset-bottom)`).

### 6. Profil Atlet & Wizard Pendaftaran
- **Spider Radar Polygon 5-Dimensi**: Visualisasi skill atlet (Power, Agility, Serve, Volley, Defense) berbasis `recharts` SVG.
- **4 Kartu Metrik Performa**: Main, Menang, Win Rate %, dan Total Juara.
- **6-Step Registration Wizard**: Pemilihan Kategori ➔ Kapten ➔ Partner ➔ Review Biaya ➔ Transfer Bank & Upload Bukti Pembayaran.

### 7. WhatsApp Gateway (sidobe.com) & Blog CMS
- **Sidobe WhatsApp Service**: Terisolasi dengan audit trail di `whatsapp_logs`, template dinamis, dan Sandbox Simulator Superadmin.
- **Blog CMS Engine**: Rich text editor dengan sanitasi anti-XSS (`HTMLPurifier`), SEO metadata generator, dan portal publik `/blog`.
- **Ledger Payout Requests**: Pengajuan penarikan dana EO dengan approval dan upload struk transfer perbankan.

---

## 🛡️ Security Hardening & Kepatuhan Arsitektur

| Aspek Keamanan | Implementasi |
| :--- | :--- |
| **HTTP Security Headers** | `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`. |
| **Anti-XSS Sanitization** | `Mews\Purifier` (HTMLPurifier) membersihkan tag berbahaya `<script>`, `onerror`, `onclick` pada deskripsi turnamen & artikel blog. |
| **Proteksi IDOR** | Validasi kepemilikan turnamen di seluruh controller EO (`authorizeTournament`), mencegah EO A mengakses data EO B. |
| **Anti-N+1 Query Detection** | `Model::shouldBeStrict(!app()->isProduction())` aktif di `AppServiceProvider`. |
| **Rate Limiter (Throttling)** | Pembatasan request pada endpoint pendaftaran (`10/menit`), API wilayah (`60/menit`), testing WA (`5/menit`), dan scoring wasit (`120/menit`). |
| **Dual-DB Dialect Safety** | Migrasi 100% menggunakan Laravel Fluent Schema Blueprint yang kompatibel tanpa modifikasi baik di SQLite lokal maupun MySQL 8.0+ produksi. |

---

## 💻 Panduan Instalasi & Menjalankan Lokal

### Prasyarat
- PHP >= 8.2 (Disarankan PHP 8.4)
- Composer >= 2.x
- Node.js >= 20.x & npm
- SQLite (Local Dev) atau MySQL 8.0+ (Production)

### Langkah Setup

1. **Clone & Install Dependensi:**
   ```bash
   git clone <repository_url> padelgigs
   cd padelgigs
   composer install
   npm install
   ```

2. **Konfigurasi Environment:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Migrasi Database & Seeding Wilayah / Master Data:**
   ```bash
   touch database/database.sqlite
   php artisan migrate:fresh --seed
   ```
   *Catatan: Database seeder otomatis mengisi 38 Provinsi & 514 Kota/Kabupaten Indonesia, Roles (superadmin, organizer, player), Master Tiers, Divisions, dan Skill Levels.*

4. **Kompilasi Asset Frontend:**
   ```bash
   # Development Server (Hot Module Replacement)
   npm run dev

   # Atau Build Produksi Bundle
   npm run build
   ```

5. **Jalankan Aplikasi:**
   ```bash
   php artisan serve
   ```
   Buka browser di `http://localhost:8000`.

---

## 🧪 Menjalankan Test Suite Otomatis

Platform telah dilengkapi dengan pengujian end-to-end terintegrasi menggunakan PHPUnit / Pest:

```bash
# Menjalankan seluruh test suite (73 tests, 335 assertions)
php artisan test

# Menjalankan suite audit keamanan spesifik
php artisan test tests/Feature/SecurityAuditTest.php
```

---

## 👥 Hak Akses & Peran Pengguna Default

| Role | Akses Utama |
| :--- | :--- |
| **Superadmin** | `/admin/master` (Master Data), `/admin/whatsapp` (Gateway WA), `/admin/blog` (CMS), `/admin/payouts` (Ledger), Impersonasi EO. |
| **Organizer (EO)** | `/organizer/tournaments` (Buat & Kelola Turnamen), Match Engine, Court Control, Check-in Presensi, PDF Match Sheet. |
| **Referee (Wasit)** | `/referee/{token}` (Akses instan skor mobile tanpa login). |
| **Player / Publik** | `/` (Katalog & Live Radar), `/tournaments/{slug}` (6-Tab Portal), `/tournaments/{slug}/register` (Wizard), `/players/{id}` (Profil Radar 5D). |

---

## 📄 Lisensi
Hak Cipta © 2026 Koceevent Platform. Dilindungi Undang-Undang.
