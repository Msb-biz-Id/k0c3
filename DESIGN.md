# MASTER DESIGN SYSTEM & UI/UX SPECIFICATION (ANTISLOP EDITION)
## PadelGigs Core Tournament, EO Operating System & Superadmin Platform
**Design Philosophy:** Anti-Generic, Tactile Sports Luxury, Broadcast Grade, Zero Emoji, Pure Vector Icons  
**Frontend Stack:** Tailwind CSS v4, React 19, Lucide React Icons, Framer Motion, Radix UI Primitives  
**Target:** Desktop, Tablet, Mobile (Wasit & Pemain), dan TV/Projector Kiosk (1080p / 4K)  
**Date:** Oktober 2026  

---

## 1. DESIGN PHILOSOPHY: THE "ANTISLOP" STANDARD

Platform olahraga sering kali terjebak dalam dua ekstrem: terlalu sederhana (seperti spreadsheet biasa) atau terlalu berlebihan dengan gradien neon norak khas template murahan (*AI Slop*).

PadelGigs mengadopsi filosofi **Tactile Sports Luxury & Broadcast Grade**:
1. **Zero Emoji Standard**: Seluruh penanda visual, badge, status, dan hierarki menggunakan **Dynamic Vector Icons (Lucide React)** yang terukur, konsisten secara geometris, dan profesional. Tidak ada penggunaan karakter emoji Unicode di seluruh antarmuka.
2. **Sensasi Fisik Padel**: Nuansa warna biru tua lapangan panoramik (*WPT Blue*), aksen hijau bola padel (*Volt Padel Lime*), dan tekstur kaca transparan (*Court Glassmorphism*).
3. **Kepadatan Informasi Terstruktur (High-Density UI)**: Meja pertandingan (Tournament Desk) membutuhkan visibilitas tinggi tanpa membuang ruang layar. Data skor, status pemain, dan lapangan harus terbaca dalam 0.5 detik dari jarak 2 meter.
4. **Motion with Intent**: Animasi bukan sekadar hiasan; animasi digunakan untuk menyampaikan status real-time (*Pulsing beacon hijau saat match ON COURT, odometer score counter, dan transisi bagan yang mengalir*).
5. **Kustomisasi Tema Dinamis**: Sistem mendukung pengaturan warna aksen dinamis dan pilihan tipografi yang fleksibel bagi penyelenggara turnamen dan Superadmin.

---

## 2. PENGATURAN TEMA DINAMIS (DYNAMIC ACCENT COLOR & TYPOGRAPHY ENGINE)

Sistem antarmuka dilengkapi mesin pengaturan visual terpusat pada menu `/settings/appearance` dan pengaturan kustom branding turnamen (EO Branding Setting):

### 2.1 Dynamic Accent Color Engine
Warna aksen utama disuntikkan secara dinamis melalui variabel CSS pada elemen root (`html[data-accent="..."]`):

| Preset Aksen | Token Utama | Hover State | Glow Effect (Alpha 18%) | Karakter Visual |
| :--- | :--- | :--- | :--- | :--- |
| **Volt Padel Lime (Default)** | `#a3e635` | `#84cc16` | `rgba(163, 230, 53, 0.18)` | Warna resmi bola padel neon |
| **WPT Cyan Blue** | `#0284c7` | `#0369a1` | `rgba(2, 132, 199, 0.18)` | Karpet lapangan Premier Padel |
| **Clay Court Amber** | `#f59e0b` | `#d97706` | `rgba(245, 158, 11, 0.18)` | Warna tanah liat lapangan Spanyol |
| **Emerald Stadium** | `#10b981` | `#059669` | `rgba(16, 185, 129, 0.18)` | Rumput lapangan hijau tua klasik |
| **Hyper Violet / Night** | `#8b5cf6` | `#7c3aed` | `rgba(139, 92, 246, 0.18)` | Sesi malam turnamen indoor |
| **Custom Hex / HSL Picker** | *User Defined* | *Calculated* | *Calculated* | Kustomisasi sponsor turnamen |

Implementasi CSS Tailwind CSS v4:
```css
@theme {
  --color-slate-950: #07090e;      /* Canvas Background */
  --color-slate-900: #0d121d;      /* Elevated Card Background */
  --color-slate-850: #131b2e;      /* Interactive Container */
  --color-slate-800: #1b2640;      /* Border Subtle */
  --color-slate-700: #29385c;      /* Border Focus */

  /* Dynamic Accent Injection */
  --color-accent-primary: var(--app-accent, #a3e635);
  --color-accent-hover: var(--app-accent-hover, #84cc16);
  --color-accent-glow: var(--app-accent-glow, rgba(163, 230, 53, 0.18));

  --color-amber-warning: #f59e0b;
  --color-rose-danger: #f43f5e;
  --color-emerald-success: #10b981;
}
```

---

### 2.2 Dynamic Typography Switcher
Tersedia 3 preset pasangan font berstandar tinggi yang dapat dipilih pengguna:

1. **Preset A: Athletic Broadcast (Default)**
   * Headings / Skor: `'Outfit', sans-serif` (Bold, geometris, modern).
   * Data & Interface: `'Inter', sans-serif` (Keterbacaan tinggi).
   * Stopwatch & Token: `'JetBrains Mono', monospace`.
2. **Preset B: Clean Tech Minimal**
   * Headings / Skor: `'Plus Jakarta Sans', sans-serif`.
   * Data & Interface: `'Geist Sans', sans-serif`.
   * Stopwatch & Token: `'Geist Mono', monospace`.
3. **Preset C: Classic Championship**
   * Headings / Skor: `'Cabinet Grotesk', sans-serif`.
   * Data & Interface: `'DM Sans', sans-serif`.
   * Stopwatch & Token: `'Fira Code', monospace`.

---

## 3. CHOREOGRAPHY ANIMASI INTERAKTIF (FRAMER MOTION & CSS-KEYFRAMES)

Animasi dirancang secara matematis dengan prinsip haptik dan tactile responsiveness:

### 3.1 Live Court Pulsing Beacon
Indikator pertandingan berjalan menggunakan animasi beacon berlapis:
```css
@keyframes court-beacon {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 var(--color-accent-glow); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(163, 230, 53, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(163, 230, 53, 0); }
}
```

### 3.2 Animated Number Odometer (Live Score Ticker)
Saat skor game berubah dari `4` menjadi `5`, angka tidak langsung berganti kaku, melainkan menggunakan motion spring slide vertikal:
```tsx
import { motion, AnimatePresence } from "framer-motion";

export function ScoreOdometer({ value }: { value: number }) {
  return (
    <div className="relative h-9 w-7 overflow-hidden text-center font-display text-3xl font-black text-accent-primary">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -24, opacity: 0 }}
          transition={{ type: "spring", stiffness: 450, damping: 30 }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
```

### 3.3 Interactive Tab Indicator (Framer Motion `layoutId`)
Perpindahan 6 tab publik turnamen (*Live Score, Order of Play, Results, Leaderboard, Bracket, Slideshow*) menggunakan slider pill yang meluncur mulus mengikuti tab yang aktif tanpa jeda:
```tsx
{activeTab === tab.id && (
  <motion.div
    layoutId="activeTabBadge"
    className="absolute inset-0 rounded-xl bg-slate-800 border border-slate-700 shadow-md"
    transition={{ type: "spring", stiffness: 400, damping: 32 }}
  />
)}
```

### 3.4 3D Flip Card Distribution (Mulai Undian Grup)
Saat EO menekan tombol *Mulai Undian Grup*, kartu-kartu tim mengalami animasi pengacakan 3D shuffle sebelum mendarat di keranjang Grup A dan Grup B secara berurutan.

### 3.5 Animated Beam Path & Radar (Motion/React & Pure CSS GPU Keyframes)
Untuk visualisasi vektor kompleks dan micro-dynamics dengan performa maksimal 120 FPS:
* **Bracket Glow Beam Trail (`motion/react`)**:
  * Garis penghubung babak pada bagan sistem gugur menggunakan SVG `<motion.path>` terakselerasi WAAPI (Web Animations API) dengan efek berkas cahaya (*Glow Beam*) yang merayap dari babak sebelumnya ke slot pemenang saat match selesai:
  ```tsx
  import { motion } from "motion/react";

  export function BracketBeamPath({ d, isWinnerActive }: { d: string; isWinnerActive: boolean }) {
    return (
      <motion.path
        d={d}
        initial={{ pathLength: 0, opacity: 0.2 }}
        animate={{
          pathLength: isWinnerActive ? 1 : 0.2,
          opacity: isWinnerActive ? 1 : 0.2,
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className={isWinnerActive 
          ? "stroke-emerald-400 stroke-2 fill-none drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" 
          : "stroke-slate-700 stroke-1 fill-none"
        }
      />
    );
  }
  ```
* **Stadium Radar Orbit (Pure CSS3 GPU Keyframes - 0 KB JS Overhead)**:
  * Pada landing page, radar status lapangan memutar ikon bola padel di orbit melingkar 360 derajat secara kontinu langsung di Compositor Thread GPU tanpa membebani memori JavaScript:
  ```css
  @keyframes radar-orbit {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-radar-orbit {
    animation: radar-orbit 8s linear infinite;
    will-change: transform;
  }
  ```
* **Rolling Stat Counter (`motion/react` Spring Transitions)**:
  * Angka kemenangan, total jam main, dan skor game dianimasikan bergeser vertikal menggunakan spring physics terisolasi (`AnimatePresence mode="popLayout"`).

### 3.6 Selebrasi Podium Juara (Canvas Confetti)
Saat wasit atau EO mengonfirmasi match final dan mengumumkan Juara 1 turnamen:
```ts
import confetti from "canvas-confetti";

export function fireChampionConfetti() {
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#a3e635", "#38bdf8", "#fbbf24", "#ffffff"],
  });
}
```

---

### 3.7 Spesifikasi Editor Konten: Headless TipTap Rich Text Editor
Digunakan pada **Blog CMS** dan **Panduan Registrasi / Aturan Khusus EO**:
* **Paket Terintegrasi**: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/extension-youtube`.
* **Desain Bubble Toolbar & Floating Menu**:
  * Toolbar minimalis berlatar kaca transparan (`bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-2 py-1 shadow-2xl`).
  * Tombol aksi menggunakan icon Lucide: `Bold`, `Italic`, `Heading2`, `Heading3`, `List`, `ListOrdered`, `Quote`, `Link`, `Image`, `Youtube`, `Code`.
* **Output Sanitasi Bebas XSS**:
  * Teks yang dihasilkan TipTap disimpan dalam bentuk HTML terstruktur.
  * Sebelum disimpan ke database, controller memproses konten melalui `mews/purifier` (HTMLPurifier PHP) untuk memastikan tidak ada tag `<script>` atau atribut jahat yang lolos.
  * Di sisi frontend publik, artikel dirender dengan styling modern `prose prose-invert prose-emerald max-w-none`.

---

## 4. STANDAR PENGGUNAAN DYNAMIC VECTOR ICONS (LUCIDE REACT)

Menggantikan seluruh emoji dengan ikon vektor berskala dinamis:

| Konteks Antarmuka | Ikon Lucide React | Props & Styling Tailwind |
| :--- | :--- | :--- |
| **Status Live Court** | `<Radio />` | `className="h-4 w-4 text-accent-primary animate-pulse"` |
| **Pemenang / Juara** | `<Trophy />` | `className="h-5 w-5 text-amber-400"` |
| **Win Streak** | `<Flame />` | `className="h-4 w-4 text-orange-500"` |
| **Verifikasi / Approved**| `<ShieldCheck />` | `className="h-4 w-4 text-emerald-400"` |
| **Sedang Pemanasan** | `<Clock />` | `className="h-4 w-4 text-amber-400"` |
| **Panggilan Lapangan** | `<Volume2 />` | `className="h-4 w-4 text-accent-primary"` |
| **Unduh Bagan Gambar** | `<Download />` | `className="h-4 w-4 text-slate-300"` |
| **TV Slideshow Display** | `<Tv />` | `className="h-4 w-4 text-padel-blue-light"` |
| **Pemberitahuan WA** | `<MessageSquare />` | `className="h-4 w-4 text-emerald-400"` |
| **Collision Warning** | `<AlertTriangle />` | `className="h-4 w-4 text-rose-500"` |
| **Servis Bola Aktif** | `<Sparkles />` | `className="h-3.5 w-3.5 text-accent-primary"` |

---

## 5. UI/UX IMPROVISATIONS: SEBELUM (STAGING) VS SESUDAH (ANTISLOP)

### 5.1 Beranda & Portal Publik (`/`)
* **Live Match Radar Banner**: Banner dinamis di puncak halaman yang mensimulasikan denah lapangan stadium 3D mini; pengguna dapat melihat lapangan mana yang sedang ramai dengan bola berpindah dan status lapangan live.
* **Interactive Tournament Cards**: Kartu turnamen dengan efek hover 3D tilt, visual kuota melingkar (*Progress Ring*), dan chip status berdenyut (*Pulsing Live Badge*).
* **Leaderboard Hall-of-Fame Showcase**: 3 Pemain terbaik bulan ini disajikan dengan kartu atlet berprestasi, menampilkan foto profil, rasio kemenangan, dan ikon piala kejuaraan.

---

### 5.2 Detail Turnamen Publik (`/tournaments/{id}`)

#### A. Multi-Image Media Manager & Auto-Featured Gallery (Improvisasi Visual Utama)
* **Masalah pada Staging**: Hanya ada 1 kotak upload gambar poster statis di sebelah kiri, sehingga EO tidak bisa menampilkan suasana venue lapangan, foto piala, atau dokumentasi turnamen sebelumnya.
* **Improvisasi Antislop**:
  * **Multi-Image Media Uploader di Form EO (`/organizer/tournaments/create`)**:
    * EO dapat mengunggah hingga 10 foto sekaligus (Poster Utama, Foto Arena Court, Lounge Venue, Trophy Showcase, dan Sponsor Wall).
    * **Auto-Featured Image**: Foto urutan pertama secara otomatis terpilih sebagai *Gambar Unggulan (Featured Poster)*. EO juga dapat mengklik tombol bintang (*"Set as Featured"*) pada foto mana pun di galeri.
  * **Interactive Tournament Photo Carousel & Lightbox**:
    * Pada halaman publik turnamen, banner utama dilengkapi tombol indikator galeri (*contoh: "Lihat Galeri Foto (6)"* dengan ikon `<Layers className="h-4 w-4" />`).
    * Mode Carousel: Swipe horizontal di smartphone dengan thumbnail preview di bagian bawah.
    * Mode Lightbox: Klik gambar untuk membuka modal fullscreen tanpa kompresi dengan navigasi keyboard panah kiri/kanan.

#### B. Improvisasi pada 6 Tab Publik Turnamen:
* **Tab `LIVE SCORE` (Improvised)**:
  * Layout **Split Scoreboard**: Sisi kiri pasangan Tim A, sisi kanan pasangan Tim B, di tengah skor game besar ala tayangan TV SkySports / Premier Padel.
  * Indikator **Serve Point Active**: Ikon `<Sparkles />` aksen volt menyala di samping nama pemain yang memegang servis.
  * **Live Point-by-Point Timeline**: Linimasa game yang merekam skor berkala dengan penanda *Golden Point (GP)*.
* **Tab `ORDER OF PLAY` (Improvised)**:
  * Menyajikan **Court-Lane Timeline View**: Toggle antara tampilan tabel daftar biasa vs tampilan *Swimlane per Lapangan* (Kolom Lapangan 1, Lapangan 2, Lapangan 3) layaknya papan jadwal bandara internasional.
  * Chip estimasi waktu main (*"Mulai dalam ~25 menit"*).
* **Tab `RESULTS` (Improvised)**:
  * Kartu match yang selesai menampilkan badge skor set dengan visualisasi pemenang bertanda `<CheckCircle2 />` hijau tegas, serta catatan durasi tanding.
* **Tab `LEADERBOARD` (Improvised)**:
  * Desain tabel klasemen bergaya Formula 1: Nomor posisi tim diberi highlight warna emas untuk Posisi 1, perak untuk Posisi 2, dan perunggu untuk Posisi 3.
  * Garis pemisah zona lolos (*Qualification Cutoff Barrier*) memiliki aksen hijau neon dengan label *"ZONA LOLOS KNOCKOUT"*.
* **Tab `BRACKET` (Improvised)**:
  * **Interactive Vector Tree**: Garis penghubung babak menggunakan SVG dinamis yang menyala mengikuti jalur tim pemenang hingga ke babak Final.
  * Tombol zoom-in, zoom-out, dan minimap geser untuk navigasi bagan pada layar smartphone.
* **Tab `SLIDESHOW` (TV Venue Display Improvised)**:
  * Tampilan Kiosk **Broadcast TV 16:9 / 4K**:
  * Jam digital berjalan, nama turnamen, dan logo sponsor bergerak halus.
  * Sisi kanan: QR Code beresolusi tinggi dengan label *"Scan untuk Live Score di Smartphone"*.
  * Transisi mulus (Fade and Slide) setiap 10 detik antar mode: *Live Court Matrix*, *Next Matches Up*, dan *Group Standings*.

---

### 5.3 Halaman Profil Single Player (`/leaderboard/{uuid}`)
* **Player Attribute Radar (Polygon Chart)**: Grafik jaring laba-laba 5 dimensi mengukur: *Win Rate*, *Aggressiveness (Game Difference)*, *Tournament Experience*, *Clutch Factor (Menang Tie-Break/Golden Point)*, dan *Consistency*.
* **Streak Badges**: Badge dinamis dengan ikon `<Flame className="text-orange-500" />` untuk *"5-Win Streak"* atau `<Trophy className="text-amber-400" />` untuk *"Inpedia Champion 2026"*.
* **Partner Synergy Matrix**: Menampilkan daftar pemain yang pernah menjadi pasangan bertanding beserta persentase kemenangan saat berpasangan (*Win Rate with Partner*).

---

### 5.4 Meja Operasional EO: Tournament Desk & Court Control
* **Court Station Tiles**: Kartu lapangan dirancang berukuran besar (*Touch-Friendly 44px+ hit targets*) dengan warna status kontras tinggi:
  * `KOSONG`: Latar abu-abu gelap dengan tombol *"Alokasikan Match Berikutnya"*.
  * `PEMANASAN`: Aksen oranye dengan countdown timer pemanasan resmi (5 menit).
  * `SEDANG MAIN`: Aksen neon volt dengan penanda poin real-time dan stopwatch match.
* **Tombol Cepat "Court Walkie-Talkie / Panggil Lapangan"**: Sekali klik tombol *Panggil*, sistem membunyikan chimes audio di venue dan men-dispatch pesan WhatsApp via sidobe.com ke HP pemain.
* **Quick Score Keypad**: Modal input skor dengan keypad angka besar sehingga wasit di tiang lapangan bisa memasukkan skor game 6-4 dengan satu sentuhan jempol tanpa keyboard virtual menutupi layar.

---

### 5.5 Penjadwalan Lapangan Interaktif (Schedule Grid)
* **Smart Collision Detection**: Deteksi bentrok otomatis dengan highlight merah jika pemain dijadwalkan di 2 match bersamaan atau belum memiliki jeda istirahat minimal 30 menit (*Rest-Time Rule*).
* **Snap-to-Slot Drag & Drop**: Menggunakan library `@hello-pangea/dnd` dengan feedback tactile dan animasi snap halus.

---

### 5.6 Ruang Kontrol Superadmin & WhatsApp sidobe.com
* **WhatsApp Telemetry Dashboard**:
  * Status koneksi nomor WhatsApp sidobe.com secara visual (*Device Online / Session Valid*).
  * Gauge pengiriman pesan real-time (*Pesan Terkirim, Delivered, Gagal*).
  * Sandbox Simulator: Panel simulator interaktif untuk mengetes pesan WhatsApp sebelum diterapkan ke template produksi.
* **Impersonation Action Bar**: Saat Superadmin login sebagai EO, muncul bar mengambang (*Floating Bar*) berwarna kuning elegan di bagian atas layar: *"Anda sedang login sebagai EO: KOCE Event. [Kembali ke Superadmin]"*.

---

### 5.7 Pusat Kendali Master Data Dinamis Superadmin (Tier, Divisi, Level Skill)
Antarmuka Superadmin untuk mengelola master data turnamen dirancang dengan standar *Anti-Slop Enterprise UI*:

* **Tab Master Selector**: Navigasi segmented pill di bagian atas:
  * `<Layers className="w-4 h-4 mr-2" />` **Tier Turnamen** (Mini, Grand, Open, Community, dll.)
  * `<Users className="w-4 h-4 mr-2" />` **Divisi Kategori** (Men, Women, Mixed, Open, dll.)
  * `<Award className="w-4 h-4 mr-2" />` **Level Skill Pemain** (Newbie, Rookie, Beginner, Intermediate, dll.)
* **Reorder Drag & Drop Handle**:
  * Setiap baris tabel dilengkapi handle `<GripVertical className="w-4 h-4 text-slate-500 cursor-grab hover:text-slate-200" />` untuk mengubah urutan (*sort_order*) secara instan dengan animasi reorder Framer Motion `layout`.
* **Inline Status Toggle Switch**:
  * Menggunakan animated switch slider: Hijau neon (`bg-emerald-500`) saat aktif, Slate redup (`bg-slate-700`) saat non-aktif. Mengubah status secara real-time via optimistic UI tanpa perlu reload halaman.
* **Modal Tambah / Edit Data**:
  * Drawer modal dengan latar belakang blur (`backdrop-blur-md bg-slate-900/90 border border-slate-800`).
  * Form fields: Nama, Slug (otomatis dari nama), Badge Color Preview (untuk tier), Rentang Rating Min-Max (untuk level skill), serta Deskripsi panduan.
* **Modal Hapus Aman (Safe Deletion with Impact Warning)**:
  * Menggunakan icon `<AlertTriangle className="w-6 h-6 text-amber-400" />`.
  * Menampilkan kalkulasi penggunaan real-time: *"Level ini sedang digunakan oleh 8 kategori turnamen aktif. Data tidak akan dihapus permanen melainkan diarsipkan (Soft Delete). Turnamen lama akan tetap menampilkan snapshot nama ini."*
  * Tombol konfirmasi dengan styling merah bertekstur: `bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-900/30`.

---

## 6. ARSITEKTUR MOBILE APP-FIRST (NATIVE-LIKE EXPERIENCE & MOBILE BOTTOM NAV)

Sebagian besar pemain, penonton, dan wasit mengakses PadelGigs melalui smartphone di lapangan (outdoor/indoor). Oleh karena itu, antarmuka mobile dirombak dari sekadar "responsive web" menjadi **Mobile App-First (PWA Experience)**:

### 6.1 Fixed Mobile Bottom Navigation Bar (`<MobileBottomNav />`)
Pada viewport mobile (`max-w-md` atau `< 768px`), navigasi desktop disembunyikan dan digantikan oleh bilah navigasi bawah tetap (*Fixed Bottom Navigation Bar*) yang menempel di dasar layar:

* **Struktur Glassmorphism & Safe Area**:
  * Menggunakan `pb-[env(safe-area-inset-bottom)]` untuk kompatibilitas penuh dengan gesture bar iPhone dan Android.
  * Latar belakang `bg-slate-950/85 backdrop-blur-xl border-t border-slate-800/80 shadow-2xl`.
* **5 Destinasi Utama Bilah Bawah**:
  1. **`Home`**: Ikon `<Home />` $\rightarrow$ Beranda & Ticker Turnamen.
  2. **`Tournaments`**: Ikon `<Trophy />` $\rightarrow$ Direktori & Jadwal Turnamen.
  3. **`Live`**: Ikon `<Radio />` dengan indikator *Pulsing Dot Live* hijau neon $\rightarrow$ Langsung membuka layar Live Score lapangan yang sedang aktif.
  4. **`Leaderboard`**: Ikon `<BarChart3 />` $\rightarrow$ Peringkat Pemain Nasional & Hall of Fame.
  5. **`Profile / Desk`**:
     * Untuk Pemain: Ikon `<User />` $\rightarrow$ Akun Saya, Riwayat Turnamen & Tiket.
     * Untuk EO / Wasit: Ikon `<LayoutDashboard />` $\rightarrow$ Akses cepat ke Tournament Desk & Court Control.

### 6.2 Mobile Top Bar & App Header
* Header atas mobile dibuat ramping (*Height 56px*) berlatar transparan blur dengan:
  * Brand Mark Logo mini `PADELGIGS`.
  * Ikon `<Search />` untuk pencarian instan turnamen & pemain.
  * Ikon `<Bell />` notifikasi dengan badge merah jika ada panggilan lapangan (*Court Call*) atau jadwal match baru.

### 6.3 Mobile Bottom Sheet Drawers (Menggantikan Modal Desktop yang Kaku)
* Seluruh form interaktif di mobile (filter turnamen, pendaftaran tim, kuesioner jersey/NIK, dan input skor wasit) menggunakan **Bottom Sheet Drawer** (berbasis `vaul` / `radix-ui` primitives) yang dapat digeser naik-turun menggunakan sentuhan jempol (*Swipe to dismiss*).

### 6.4 Gestur & Ergonomi Sentuh Lapangan
* **Pull-to-Refresh**: Tarik layar ke bawah untuk memperbarui status skor dan jadwal terbaru secara instan.
* **Scrollable Horizontal Pill Tabs**: Tab kategori (*Bronze Men*, *Bronze Women*) dan tab publik (*Live Score, Order of Play, Results*) dapat digeser secara horizontal dengan efek snap sentuh.
* **Area Sentuh Minimal 48px**: Seluruh tombol aksi lapangan dirancang untuk jari yang basah oleh keringat pemain di pinggir lapangan.

---

## 7. SPESIFIKASI KOMPONEN KODE UTAMA (TACTILE ZERO-EMOJI)

### 7.1 Mobile Bottom Navigation Bar Component
```tsx
import { Home, Trophy, Radio, BarChart3, User, LayoutDashboard } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";

export function MobileBottomNav({ userRole }: { userRole?: string }) {
  const { url } = usePage();

  const navItems = [
    { label: "Home", href: "/", icon: Home, active: url === "/" },
    { label: "Turnamen", href: "/tournaments", icon: Trophy, active: url.startsWith("/tournaments") },
    { 
      label: "Live", 
      href: "/live", 
      icon: Radio, 
      active: url.startsWith("/live"), 
      hasLiveBadge: true 
    },
    { label: "Ranking", href: "/leaderboard", icon: BarChart3, active: url.startsWith("/leaderboard") },
    { 
      label: userRole === "organizer" ? "EO Desk" : "Profil", 
      href: userRole === "organizer" ? "/dashboard" : "/profile", 
      icon: userRole === "organizer" ? LayoutDashboard : User, 
      active: url.startsWith("/dashboard") || url.startsWith("/profile") 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.4)]">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center relative py-1 px-3 rounded-xl transition-all ${
                item.active ? "text-accent-primary" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${item.active ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
                {item.hasLiveBadge && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary" />
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${item.active ? "font-bold text-accent-primary" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### 7.2 Match Score Card Component
```tsx
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-md transition-all hover:border-accent-primary/40">
      {/* Status Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-accent-primary animate-ping" />
          <Radio className="h-4 w-4 text-accent-primary" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-accent-primary">
            {match.court_name} • ON COURT
          </span>
        </div>
        <span className="rounded-full bg-slate-800 px-2.5 py-0.5 font-mono text-[11px] text-slate-300">
          1SET • FIRST6 • GP
        </span>
      </div>

      {/* Team Matchup Rows */}
      <div className="mt-4 space-y-3">
        {/* Team 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-200 ring-2 ring-slate-700">
              T1
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-100">{match.team_1.name}</p>
              <span className="text-[11px] text-slate-400">Seeded #1</span>
            </div>
          </div>
          <ScoreOdometer value={match.score_t1} />
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-200 ring-2 ring-slate-700">
              T2
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-100">{match.team_2.name}</p>
              <span className="text-[11px] text-slate-400">Unseeded</span>
            </div>
          </div>
          <ScoreOdometer value={match.score_t2} />
        </div>
      </div>

      {/* Footer Action */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <span className="font-mono text-xs text-slate-400">Game berjalan • Deuce (Golden Point)</span>
        <button className="rounded-lg bg-accent-primary px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-accent-hover">
          Input Skor
        </button>
      </div>
    </div>
  );
}
```

---

## 7. KESIMPULAN

Sistem desain ini sepenuhnya mematuhi prinsip **Anti-Slop**:
* **Bebas Emoji 100%**: Mengutamakan dynamic vector icons yang serasi dan profesional.
* **Koreografi Animasi Reaktif**: Menggunakan motion spring, odometer score, dan layout transitions.
* **Kustomisasi Dinamis**: Pilihan warna aksen (Volt, Cyan, Amber, Emerald, Violet, Custom Hex) dan 3 preset tipografi modern (`Outfit + Inter`, `Jakarta + Geist`, `Cabinet + DM Sans`).
