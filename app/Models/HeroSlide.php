<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class HeroSlide extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'badge_text',
        'title',
        'subtitle',
        'image_path',
        'cta_text',
        'cta_link',
        'secondary_cta_text',
        'secondary_cta_link',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public const CACHE_KEY = 'global_hero_slides_active';

    public static function getActiveSlides(): array
    {
        try {
            $cached = Cache::get(self::CACHE_KEY);
            if (is_array($cached)) {
                return $cached;
            }
        } catch (\Throwable) {
            // In case of cache driver unserialize issues
        }

        $slides = self::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();

        try {
            Cache::forever(self::CACHE_KEY, $slides);
        } catch (\Throwable) {
            // Ignore cache write issues
        }

        return $slides;
    }

    public static function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    protected static function booted()
    {
        static::saved(function () {
            self::clearCache();
        });

        static::deleted(function () {
            self::clearCache();
        });
    }
}
