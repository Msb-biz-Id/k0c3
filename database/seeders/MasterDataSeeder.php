<?php

namespace Database\Seeders;

use App\Models\MasterDivision;
use App\Models\MasterSkillLevel;
use App\Models\MasterTier;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Seed Master Tiers
        $tiers = [
            ['name' => 'Mini', 'slug' => 'mini', 'badge_color' => '#38bdf8', 'sort_order' => 1, 'description' => 'Turnamen 1 hari kuota kompak & kilat'],
            ['name' => 'Grand', 'slug' => 'grand', 'badge_color' => '#a3e635', 'sort_order' => 2, 'description' => 'Turnamen utama bergengsi akhir pekan'],
            ['name' => 'Open', 'slug' => 'open', 'badge_color' => '#fbbf24', 'sort_order' => 3, 'description' => 'Turnamen terbuka umum skala besar antar klub'],
            ['name' => 'Community', 'slug' => 'community', 'badge_color' => '#c084fc', 'sort_order' => 4, 'description' => 'Turnamen internal komunitas santai'],
        ];

        foreach ($tiers as $tier) {
            MasterTier::firstOrCreate(
                ['slug' => $tier['slug']],
                array_merge($tier, ['is_active' => true])
            );
        }

        // 2. Seed Master Divisions
        $divisions = [
            ['name' => 'Men', 'slug' => 'men', 'gender_restriction' => 'male', 'sort_order' => 1],
            ['name' => 'Women', 'slug' => 'women', 'gender_restriction' => 'female', 'sort_order' => 2],
            ['name' => 'Mixed', 'slug' => 'mixed', 'gender_restriction' => 'mixed', 'sort_order' => 3],
            ['name' => 'Open', 'slug' => 'open', 'gender_restriction' => 'any', 'sort_order' => 4],
        ];

        foreach ($divisions as $division) {
            MasterDivision::firstOrCreate(
                ['slug' => $division['slug']],
                array_merge($division, ['is_active' => true])
            );
        }

        // 3. Seed Master Skill Levels (Persis audit live stage.padelgigs.id)
        $skillLevels = [
            ['name' => 'Newbie', 'slug' => 'newbie', 'min_rating' => 1.0, 'max_rating' => 1.9, 'sort_order' => 1, 'description' => 'Pemain baru mengenal raket padel & dasar servis'],
            ['name' => 'Rookie', 'slug' => 'rookie', 'min_rating' => 2.0, 'max_rating' => 2.4, 'sort_order' => 2, 'description' => 'Mulai memahami pantulan kaca dasar dan rally santai'],
            ['name' => 'Beginner', 'slug' => 'beginner', 'min_rating' => 2.5, 'max_rating' => 2.9, 'sort_order' => 3, 'description' => 'Konsisten melakukan rally dan penempatan bola dasar'],
            ['name' => 'Upper Beginner', 'slug' => 'upper-beginner', 'min_rating' => 3.0, 'max_rating' => 3.4, 'sort_order' => 4, 'description' => 'Mulai menguasai bandeja, volei net, dan transisi pertahanan'],
            ['name' => 'Intermediate', 'slug' => 'intermediate', 'min_rating' => 3.5, 'max_rating' => 4.4, 'sort_order' => 5, 'description' => 'Rally cepat, smash bantai, penempatan bola akurat'],
            ['name' => 'Lower Bronze', 'slug' => 'lower-bronze', 'min_rating' => 4.5, 'max_rating' => 4.9, 'sort_order' => 6, 'description' => 'Kemampuan kompetitif tingkat lanjut & kontrol taktik matang'],
            ['name' => 'Bronze', 'slug' => 'bronze', 'min_rating' => 5.0, 'max_rating' => 5.4, 'sort_order' => 7, 'description' => 'Turnamen level bronze resmi dengan intensitas tinggi'],
            ['name' => 'Open', 'slug' => 'open', 'min_rating' => 5.5, 'max_rating' => 7.0, 'sort_order' => 8, 'description' => 'Kategori terbuka untuk seluruh petarung padel berpengalaman'],
            ['name' => 'Consolation', 'slug' => 'consolation', 'min_rating' => 1.0, 'max_rating' => 7.0, 'sort_order' => 9, 'description' => 'Bagan hiburan untuk runner-up dan tim gugur'],
        ];

        foreach ($skillLevels as $skill) {
            MasterSkillLevel::firstOrCreate(
                ['slug' => $skill['slug']],
                array_merge($skill, ['is_active' => true])
            );
        }
    }
}
