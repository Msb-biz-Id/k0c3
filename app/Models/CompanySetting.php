<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class CompanySetting extends Model
{
    use HasFactory;

    protected $table = 'company_settings';

    protected $fillable = [
        'company_name',
        'base_url',
        'tagline',
        'about_text',
        'logo_light_path',
        'logo_dark_path',
        'favicon_path',
        'email',
        'phone',
        'whatsapp_number',
        'address',
        'google_maps_embed',
        'social_links',
        'seo_meta',
        'landing_sections',
        'enable_preloader',
        'primary_color',
        'custom_color_hex',
        'typography_preset',
    ];

    protected $casts = [
        'social_links' => 'array',
        'seo_meta' => 'array',
        'landing_sections' => 'array',
        'enable_preloader' => 'boolean',
    ];

    public const CACHE_KEY = 'global_company_settings';

    public static function getSettings(): self
    {
        try {
            $cached = Cache::get(self::CACHE_KEY);
            if ($cached instanceof self) {
                return $cached;
            }
        } catch (\Throwable $e) {
            // In case of cache driver unserialize issues
        }

        $settings = self::query()->first();

        if (! $settings) {
            $settings = self::create([
                'company_name' => 'Koceevent',
                'base_url' => config('app.url', 'https://koceevent.com'),
                'tagline' => 'Sports & Tournament Management Platform',
                'about_text' => 'Koceevent adalah ekosistem manajemen turnamen dan kejuaraan olahraga terlengkap di Indonesia. Menyediakan skor real-time wasit, sistem undian grup terisolasi, dan bagan sistem gugur otomatis.',
                'email' => 'support@koceevent.com',
                'phone' => '+62 812-3456-7890',
                'whatsapp_number' => '6281234567890',
                'address' => 'Jakarta Sports Arena, DKI Jakarta 12190',
                'social_links' => [
                    'instagram' => 'https://instagram.com/koceevent',
                    'tiktok' => 'https://tiktok.com/@koceevent',
                    'youtube' => 'https://youtube.com/@koceevent',
                    'linkedin' => 'https://linkedin.com/company/koceevent',
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
                    'google_site_verification' => null,
                    'google_analytics_id' => null,
                ],
                'enable_preloader' => true,
                'primary_color' => 'lime',
                'custom_color_hex' => '#a3e635',
                'typography_preset' => 'athletic_broadcast',
            ]);
        }

        try {
            Cache::forever(self::CACHE_KEY, $settings);
        } catch (\Throwable $e) {
            // Ignore cache write failures
        }

        return $settings;
    }

    public static function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
