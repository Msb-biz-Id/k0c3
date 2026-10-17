<?php

namespace Database\Seeders;

use App\Models\CompanySetting;
use App\Models\HeroSlide;
use App\Models\PartnerSlide;
use Illuminate\Database\Seeder;

class CompanyProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CompanySetting::updateOrCreate(
            ['id' => 1],
            [
                'company_name' => 'Koceevent',
                'base_url' => config('app.url', 'https://koceevent.com'),
                'tagline' => 'Sports & Tournament Management Platform',
                'about_text' => 'Koceevent adalah ekosistem manajemen turnamen dan kejuaraan olahraga terlengkap di Indonesia. Menyediakan skor real-time wasit, sistem undian grup terisolasi, dan bagan sistem gugur otomatis di 38 Provinsi & 514 Kota.',
                'email' => 'support@koceevent.com',
                'phone' => '+62 812-3456-7890',
                'whatsapp_number' => '6281234567890',
                'address' => 'Jakarta Sports Arena, DKI Jakarta 12190',
                'google_maps_embed' => '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126920.28310931215!2d106.759478!3d-6.2297465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e49fe3ddb3%3A0x72a5a04e578ee1ea!2sJakarta!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>',
                'social_links' => [
                    'instagram' => 'https://instagram.com/koceevent',
                    'tiktok' => 'https://tiktok.com/@koceevent',
                    'youtube' => 'https://youtube.com/@koceevent',
                    'linkedin' => 'https://linkedin.com/company/koceevent',
                    'twitter' => 'https://twitter.com/koceevent',
                    'facebook' => 'https://facebook.com/koceevent',
                ],
                'landing_sections' => [
                    'tournament_badge' => 'Jadwal Pertandingan',
                    'tournament_title' => 'Jadwal Turnamen & Kejuaraan',
                    'tournament_subtitle' => 'Pilih kategori, daftar bersama tim, dan pantau jalannya skor secara live.',
                    'athletes_badge' => 'Hall of Fame',
                    'athletes_title' => 'Top Atlet & Pemain Pilihan',
                    'athletes_subtitle' => 'Peringkat atlet teratas berdasarkan performa turnamen.',
                    'partners_badge' => 'Official Network',
                    'partners_title' => 'Mitra & Brand Sponsor Resmi',
                    'footer_about' => 'Solusi Ekosistem Turnamen & Kejuaraan Olahraga Terlengkap.',
                    'footer_copyright' => 'All rights reserved.',
                ],
                'seo_meta' => [
                    'meta_title' => 'Koceevent - Platform Turnamen & Ekosistem Olahraga Terpadu',
                    'meta_description' => 'Platform resmi kejuaraan olahraga & turnamen. Skor real-time wasit, undian grup terisolasi, dan bagan sistem gugur otomatis.',
                    'keywords' => 'turnamen, olahraga, live score wasit, jadwal turnamen, atlet, koceevent',
                    'og_image_path' => null,
                    'twitter_card' => 'summary_large_image',
                    'google_site_verification' => 'google-koceevent-verification-code',
                    'google_analytics_id' => 'G-KOCEEVENT123',
                ],
                'enable_preloader' => true,
                'primary_color' => 'emerald',
                'custom_color_hex' => '#10b981',
                'typography_preset' => 'athletic_broadcast',
            ]
        );
        CompanySetting::clearCache();

        // Seed Default Hero Slides if empty
        if (HeroSlide::count() === 0) {
            HeroSlide::create([
                'badge_text' => 'Official Padel Tournament Network Indonesia',
                'title' => 'Temukan Turnamen & Taklukkan Padel Court',
                'subtitle' => 'Platform resmi kejuaraan padel di 38 Provinsi & 514 Kota. Skor real-time wasit, undian grup terisolasi, dan bagan sistem gugur otomatis.',
                'image_path' => null,
                'cta_text' => 'Jelajahi Turnamen',
                'cta_link' => '/tournaments',
                'secondary_cta_text' => 'Peringkat Atlet',
                'secondary_cta_link' => '/leaderboard',
                'sort_order' => 1,
                'is_active' => true,
            ]);

            HeroSlide::create([
                'badge_text' => 'Live Score & Wasit Digital',
                'title' => 'Teknologi Wasit Lapangan Terpadu',
                'subtitle' => 'Papan skor real-time per lapangan, audit log poin wasit, dan tayangan live bracket untuk penonton & penikmat padel.',
                'image_path' => null,
                'cta_text' => 'Lihat Live Match',
                'cta_link' => '#live-radar',
                'secondary_cta_text' => 'Hall of Fame',
                'secondary_cta_link' => '#athletes',
                'sort_order' => 2,
                'is_active' => true,
            ]);
        }

        // Seed Default Partner Slides if empty
        if (PartnerSlide::count() === 0) {
            $partners = [
                ['name' => 'Bullpadel', 'tier' => 'official_racket', 'website_url' => 'https://www.bullpadel.com', 'sort_order' => 1],
                ['name' => 'Babolat', 'tier' => 'official_ball', 'website_url' => 'https://www.babolat.com', 'sort_order' => 2],
                ['name' => 'Wilson Padel', 'tier' => 'platinum', 'website_url' => 'https://www.wilson.com', 'sort_order' => 3],
                ['name' => 'Head Padel', 'tier' => 'gold', 'website_url' => 'https://www.head.com', 'sort_order' => 4],
                ['name' => 'Nox Custom', 'tier' => 'silver', 'website_url' => 'https://noxsport.es', 'sort_order' => 5],
                ['name' => 'Adidas Padel', 'tier' => 'official_apparel', 'website_url' => 'https://allforpadel.com', 'sort_order' => 6],
            ];

            foreach ($partners as $partner) {
                PartnerSlide::create([
                    'name' => $partner['name'],
                    'logo_path' => null,
                    'tier' => $partner['tier'],
                    'website_url' => $partner['website_url'],
                    'sort_order' => $partner['sort_order'],
                    'is_active' => true,
                ]);
            }
        }
    }
}
