<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\Court;
use App\Models\MasterDivision;
use App\Models\MasterSkillLevel;
use App\Models\MasterTier;
use App\Models\ScoreLog;
use App\Models\Team;
use App\Models\TeamPlayer;
use App\Models\Tournament;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Models\WhatsAppConfig;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TournamentDemoSeeder extends Seeder
{
    public function run(): void
    {
        // 1. WhatsApp Config Initial Setup
        WhatsAppConfig::firstOrCreate(
            ['id' => 1],
            [
                'base_url' => 'https://api.sidobe.com',
                'api_token' => 'demo-sidobe-token-2026',
                'device_id' => 'DEVICE-PADELGIGS-01',
                'webhook_key' => 'wh_key_padelgigs_secure',
                'is_active' => true,
                'templates' => [
                    'registration' => "Halo {player_name}, pendaftaran tim {team_name} di turnamen {tournament_name} berhasil kami terima!",
                    'court_call' => "Panggilan Lapangan: Tim {team_name} dimohon segera merapat ke {court_name}. Pertandingan akan segera dimulai!",
                    'match_result' => "Pertandingan #{match_number} selesai! Skor akhir: {score_summary}. Selamat kepada pemenang!",
                ],
            ]
        );

        // 2. Blog Categories & Posts
        $catTactics = BlogCategory::firstOrCreate(['slug' => 'taktik-dan-tips'], ['name' => 'Taktik & Tips']);
        $catGear = BlogCategory::firstOrCreate(['slug' => 'gear-dan-raket'], ['name' => 'Gear & Raket']);
        $catRules = BlogCategory::firstOrCreate(['slug' => 'regulasi-fip'], ['name' => 'Regulasi FIP']);

        $adminUser = User::where('email', 'admin@padelgigs.id')->first() ?? User::first();

        BlogPost::firstOrCreate(
            ['slug' => 'panduan-lengkap-taktik-kaca-dinding-padel'],
            [
                'author_id' => $adminUser->id,
                'category_id' => $catTactics->id,
                'title' => 'Panduan Lengkap Taktik Kaca Dinding (Pared de Fondo) untuk Pemula & Menengah',
                'excerpt' => 'Pelajari cara membaca pantulan bola di dinding kaca belakang tanpa terburu-buru melakukan smash balik.',
                'content' => '<h2>Menguasai Pantulan Dinding Kaca</h2><p>Salah satu kesalahan paling umum pemain pemula padel adalah berlari mengejar bola sebelum memantul dari kaca belakang. Kunci utama adalah membiarkan bola melewati tubuh Anda, membaca lintasan setelah menabrak kaca, lalu melakukan ayunan dorong (push) atau lob tinggi ke sudut lawan.</p><h3>3 Tips Membaca Sudut Pantul:</h3><ul><li>Jaga posisi badan tetap rendah (lutut ditekuk).</li><li>Posisikan raket di belakang pinggang sebelum bola menyentuh dinding.</li><li>Gunakan putaran pergelangan tangan untuk menghasilkan spin terkontrol.</li></ul>',
                'meta_title' => 'Panduan Taktik Kaca Dinding Padel | PadelGigs',
                'meta_description' => 'Strategi membaca dinding kaca belakang padel secara efektif dan efisien.',
                'status' => 'published',
                'published_at' => now()->subDays(3),
            ]
        );

        BlogPost::firstOrCreate(
            ['slug' => 'golden-point-vs-advantage-mengapa-padel-lebih-intens'],
            [
                'author_id' => $adminUser->id,
                'category_id' => $catRules->id,
                'title' => 'Golden Point vs Advantage: Mengapa Padel Lebih Intens dan Cepat',
                'excerpt' => 'Aturan Golden Point di skor deuce 40-40 menciptakan momen dramatis sudden-death yang disukai penonton.',
                'content' => '<h2>Filosofi Golden Point dalam Padel Modern</h2><p>Berbeda dengan tenis konvensional yang membutuhkan selisih 2 poin di deuce (Ad-In / Ad-Out), federasi FIP dan turnamen dunia Premier Padel mengadopsi <strong>Punto de Oro (Golden Point)</strong>. Di skor 40-40, pasangan penerima servis berhak memilih sisi servis (kiri atau kanan), dan siapa pun yang memenangkan poin tersebut langsung merebut game!</p>',
                'meta_title' => 'Aturan Golden Point di Turnamen Padel | PadelGigs',
                'meta_description' => 'Pahami mekanisme Golden Point deuce 40-40 dalam kejuaraan resmi padel.',
                'status' => 'published',
                'published_at' => now()->subDays(5),
            ]
        );

        // 3. Realistic Padel Athletes (Rankings Top 12)
        $athletesData = [
            ['name' => 'Jason Sugihan P.', 'email' => 'jason@padelgigs.id', 'gender' => 'male', 'skill' => 'Beginner', 'side' => 'right', 'hand' => 'right', 'rating' => 2.85, 'city' => 'KOTA JAKARTA BARAT', 'bio' => 'Competitive Padel Player - Backhand specialist'],
            ['name' => 'Kevin Sanjaya', 'email' => 'kevin@padelgigs.id', 'gender' => 'male', 'skill' => 'Intermediate', 'side' => 'left', 'hand' => 'right', 'rating' => 4.50, 'city' => 'KOTA JAKARTA SELATAN', 'bio' => 'Agile net interceptor with lightning fast reflexes'],
            ['name' => 'Marcus Gideon', 'email' => 'marcus@padelgigs.id', 'gender' => 'male', 'skill' => 'Intermediate', 'side' => 'right', 'hand' => 'right', 'rating' => 4.40, 'city' => 'KOTA JAKARTA UTARA', 'bio' => 'Power smasher & heavy bandeja builder'],
            ['name' => 'Fajar Alfian', 'email' => 'fajar@padelgigs.id', 'gender' => 'male', 'skill' => 'Intermediate', 'side' => 'left', 'hand' => 'right', 'rating' => 4.25, 'city' => 'KOTA BANDUNG', 'bio' => 'Consistent groundstroke & lob specialist'],
            ['name' => 'Hendra Setiawan', 'email' => 'hendra@padelgigs.id', 'gender' => 'male', 'skill' => 'Upper Beginner', 'side' => 'right', 'hand' => 'right', 'rating' => 4.10, 'city' => 'KOTA JAKARTA PUSAT', 'bio' => 'The Professor of drop-shots and court placement'],
            ['name' => 'Mohammad Ahsan', 'email' => 'ahsan@padelgigs.id', 'gender' => 'male', 'skill' => 'Upper Beginner', 'side' => 'left', 'hand' => 'right', 'rating' => 4.05, 'city' => 'KOTA PALEMBANG', 'bio' => 'Clutch tournament finisher with high recovery stamina'],
            ['name' => 'Anthony Ginting', 'email' => 'ginting@padelgigs.id', 'gender' => 'male', 'skill' => 'Intermediate', 'side' => 'left', 'hand' => 'right', 'rating' => 3.95, 'city' => 'KOTA CIMAHI', 'bio' => 'Speed & footwork artist on panoramic turf'],
            ['name' => 'Jonatan Christie', 'email' => 'jojo@padelgigs.id', 'gender' => 'male', 'skill' => 'Intermediate', 'side' => 'right', 'hand' => 'right', 'rating' => 3.90, 'city' => 'KOTA JAKARTA TIMUR', 'bio' => 'Defensive wall with explosive back-glass counter'],
            ['name' => 'Siti Fadia Silva', 'email' => 'fadia@padelgigs.id', 'gender' => 'female', 'skill' => 'Intermediate', 'side' => 'left', 'hand' => 'right', 'rating' => 3.80, 'city' => 'KOTA BOGOR', 'bio' => 'Aggressive net controller - Women category leader'],
            ['name' => 'Apriyani Rahayu', 'email' => 'apri@padelgigs.id', 'gender' => 'female', 'skill' => 'Intermediate', 'side' => 'right', 'hand' => 'right', 'rating' => 3.75, 'city' => 'KOTA KENDARI', 'bio' => 'Heavy baseline spin master & tournament champion'],
            ['name' => 'Gregoria Mariska', 'email' => 'jorji@padelgigs.id', 'gender' => 'female', 'skill' => 'Beginner', 'side' => 'left', 'hand' => 'right', 'rating' => 3.40, 'city' => 'KOTA WONOGIRI', 'bio' => 'Deceptive angle creator with silky soft hands'],
            ['name' => 'Putri Kusuma Wardani', 'email' => 'putrikw@padelgigs.id', 'gender' => 'female', 'skill' => 'Beginner', 'side' => 'right', 'hand' => 'right', 'rating' => 3.20, 'city' => 'KOTA TANGERANG', 'bio' => 'Rising star on the national circuit'],
        ];

        $users = [];
        foreach ($athletesData as $idx => $ath) {
            $user = User::firstOrCreate(
                ['email' => $ath['email']],
                [
                    'name' => $ath['name'],
                    'password' => Hash::make('password'),
                    'phone' => '62812999' . str_pad($idx, 4, '0', STR_PAD_LEFT),
                    'gender' => $ath['gender'],
                    'skill_level' => $ath['skill'],
                    'preferred_side' => $ath['side'],
                    'dominant_hand' => $ath['hand'],
                    'city_name' => $ath['city'],
                    'playtomic_rating' => $ath['rating'],
                    'bio' => $ath['bio'],
                    'is_active' => true,
                ]
            );
            $user->syncRoles(['player']);
            $users[] = $user;
        }

        // 4. Organizer User (KOCE Event)
        $eoUser = User::where('email', 'koceevent@padelgigs.id')->first();
        if (!$eoUser) {
            $eoUser = User::create([
                'name' => 'KOCE Event Organizer',
                'email' => 'koceevent@padelgigs.id',
                'password' => Hash::make('password'),
                'phone' => '6281234567890',
                'city_name' => 'KOTA JAKARTA SELATAN',
                'bio' => 'Official Tournament Organizer PadelGigs',
                'is_active' => true,
            ]);
            $eoUser->assignRole('organizer');
        }

        // Master records
        $tierGrand = MasterTier::where('slug', 'grand')->first() ?? MasterTier::create(['name' => 'Grand', 'slug' => 'grand', 'sort_order' => 1]);
        $tierMini = MasterTier::where('slug', 'mini')->first() ?? MasterTier::create(['name' => 'Mini', 'slug' => 'mini', 'sort_order' => 2]);
        $divMen = MasterDivision::where('slug', 'men')->first() ?? MasterDivision::create(['name' => 'Men', 'slug' => 'men', 'sort_order' => 1]);
        $divWomen = MasterDivision::where('slug', 'women')->first() ?? MasterDivision::create(['name' => 'Women', 'slug' => 'women', 'sort_order' => 2]);
        $skillInt = MasterSkillLevel::where('slug', 'intermediate')->first() ?? MasterSkillLevel::create(['name' => 'Intermediate', 'slug' => 'intermediate', 'sort_order' => 3]);
        $skillBeg = MasterSkillLevel::where('slug', 'beginner')->first() ?? MasterSkillLevel::create(['name' => 'Beginner', 'slug' => 'beginner', 'sort_order' => 2]);

        // 5. Active Live Tournament: Inpedia Padel Championship 2026
        $liveTourney = Tournament::firstOrCreate(
            ['slug' => 'inpedia-padel-championship-2026'],
            [
                'user_id' => $eoUser->id,
                'name' => 'Inpedia Padel Championship 2026',
                'venue_name' => 'Kemang Padel Club',
                'venue_address' => 'Jl. Kemang Raya No. 45, Jakarta Selatan',
                'city_id' => '3171',
                'city_name' => 'KOTA JAKARTA SELATAN',
                'province_id' => '31',
                'province_name' => 'DKI JAKARTA',
                'start_date' => now()->subDay()->toDateString(),
                'end_date' => now()->addDay()->toDateString(),
                'registration_deadline' => now()->subDays(2)->toDateString(),
                'status' => 'ongoing',
                'description' => '<p>Turnamen akbar tahunan Inpedia Padel Championship 2026 mempertemukan atlet padel terbaik se-Jabodetabek di arena Kemang Padel Club. Sistem pertandingan menggunakan regulasi resmi FIP dengan Golden Point di deuce.</p>',
                'registration_guide' => '<p>Pendaftaran tim wajib mengisi NIK dan kontak darurat. Biaya registrasi sudah termasuk official jersey kit, welcome drinks, dan bola turnamen Head Padel Pro.</p>',
                'bank_name' => 'BCA',
                'bank_account_number' => '8800112233',
                'bank_account_holder' => 'PT Koceevent Kreasi Sport',
            ]
        );

        // Courts for Inpedia
        $court1 = Court::firstOrCreate(
            ['tournament_id' => $liveTourney->id, 'name' => 'Lapangan 1 Center Court'],
            ['surface_type' => 'panoramic_turf', 'referee_token' => 'COURT1-KEMANG-2026', 'referee_pin' => '1234', 'is_active' => true]
        );
        $court2 = Court::firstOrCreate(
            ['tournament_id' => $liveTourney->id, 'name' => 'Lapangan 2 Court Barat'],
            ['surface_type' => 'panoramic_turf', 'referee_token' => 'COURT2-KEMANG-2026', 'referee_pin' => '1234', 'is_active' => true]
        );
        $court3 = Court::firstOrCreate(
            ['tournament_id' => $liveTourney->id, 'name' => 'Lapangan 3 Court Timur'],
            ['surface_type' => 'panoramic_turf', 'referee_token' => 'COURT3-KEMANG-2026', 'referee_pin' => '1234', 'is_active' => true]
        );
        $court4 = Court::firstOrCreate(
            ['tournament_id' => $liveTourney->id, 'name' => 'Lapangan 4 Court Selatan'],
            ['surface_type' => 'panoramic_turf', 'referee_token' => 'COURT4-KEMANG-2026', 'referee_pin' => '1234', 'is_active' => true]
        );

        // Category: Bronze Men
        $catBronzeMen = TournamentCategory::firstOrCreate(
            ['tournament_id' => $liveTourney->id, 'name' => 'Bronze - Men'],
            [
                'tier_id' => $tierGrand->id,
                'tier_name' => 'Grand',
                'division_id' => $divMen->id,
                'division_name' => 'Men',
                'skill_level_id' => $skillInt->id,
                'skill_level_name' => 'Intermediate',
                'format' => 'group_knockout',
                'max_teams' => 8,
                'group_count' => 2,
                'advancing_per_group' => 2,
                'registration_fee' => 750000,
                'is_open_registration' => false,
                'match_rules' => [
                    'group_stage' => ['race_to' => 6, 'format_set' => '1_set', 'deuce_rule' => 'golden_point', 'tie_break' => true, 'tie_break_points' => 7],
                    'knockout' => ['race_to' => 6, 'format_set' => 'best_of_3', 'deuce_rule' => 'golden_point', 'tie_break' => true, 'tie_break_points' => 7, 'super_tie_break_set_3' => true],
                ],
            ]
        );

        // Teams & Players for Bronze Men
        $teamsData = [
            ['name' => 'Jason / Kevin', 'group' => 'A', 'p1' => $users[0], 'p2' => $users[1]],
            ['name' => 'Marcus / Fajar', 'group' => 'A', 'p1' => $users[2], 'p2' => $users[3]],
            ['name' => 'Hendra / Ahsan', 'group' => 'A', 'p1' => $users[4], 'p2' => $users[5]],
            ['name' => 'Ginting / Jojo', 'group' => 'B', 'p1' => $users[6], 'p2' => $users[7]],
        ];

        $teams = [];
        foreach ($teamsData as $td) {
            $team = Team::firstOrCreate(
                ['category_id' => $catBronzeMen->id, 'name' => $td['name']],
                [
                    'group_letter' => $td['group'],
                    'payment_status' => 'verified',
                    'payment_amount' => 750000,
                    'is_checked_in' => true,
                    'checked_in_at' => now()->subHours(4),
                ]
            );

            TeamPlayer::firstOrCreate(
                ['team_id' => $team->id, 'player_order' => 1],
                [
                    'user_id' => $td['p1']->id,
                    'name' => $td['p1']->name,
                    'phone' => $td['p1']->phone,
                    'email' => $td['p1']->email,
                    'jersey_size' => 'L',
                ]
            );

            TeamPlayer::firstOrCreate(
                ['team_id' => $team->id, 'player_order' => 2],
                [
                    'user_id' => $td['p2']->id,
                    'name' => $td['p2']->name,
                    'phone' => $td['p2']->phone,
                    'email' => $td['p2']->email,
                    'jersey_size' => 'M',
                ]
            );

            $teams[] = $team;
        }

        // Match 1: Completed in Group A (Hendra/Ahsan vs Marcus/Fajar)
        $m1 = TournamentMatch::firstOrCreate(
            ['category_id' => $catBronzeMen->id, 'match_number' => 1],
            [
                'stage' => 'group',
                'group_letter' => 'A',
                'round_name' => 'Grup A Match 1',
                'round_order' => 1,
                'team1_id' => $teams[2]->id, // Hendra/Ahsan
                'team2_id' => $teams[1]->id, // Marcus/Fajar
                'court_id' => $court1->id,
                'status' => 'completed',
                'winner_team_id' => $teams[2]->id,
                'team1_set1_score' => 6,
                'team2_set1_score' => 4,
                'scheduled_time' => now()->subHours(2)->toDateTimeString(),
            ]
        );

        // Match 2: LIVE ON COURT 1 (Jason/Kevin vs Marcus/Fajar)
        $m2 = TournamentMatch::firstOrCreate(
            ['category_id' => $catBronzeMen->id, 'match_number' => 2],
            [
                'stage' => 'group',
                'group_letter' => 'A',
                'round_name' => 'Grup A Match 2',
                'round_order' => 2,
                'team1_id' => $teams[0]->id, // Jason/Kevin
                'team2_id' => $teams[1]->id, // Marcus/Fajar
                'court_id' => $court1->id,
                'status' => 'in_progress',
                'team1_set1_score' => 4,
                'team2_set1_score' => 3,
                'current_game_score' => '30 - 15',
                'server_team' => 1,
                'scheduled_time' => now()->subMinutes(25)->toDateTimeString(),
            ]
        );

        // Match 3: LIVE ON COURT 2 (Jason/Kevin vs Hendra/Ahsan)
        $m3 = TournamentMatch::firstOrCreate(
            ['category_id' => $catBronzeMen->id, 'match_number' => 3],
            [
                'stage' => 'group',
                'group_letter' => 'A',
                'round_name' => 'Grup A Match 3',
                'round_order' => 3,
                'team1_id' => $teams[0]->id, // Jason/Kevin
                'team2_id' => $teams[2]->id, // Hendra/Ahsan
                'court_id' => $court2->id,
                'status' => 'in_progress',
                'team1_set1_score' => 2,
                'team2_set1_score' => 1,
                'current_game_score' => '15 - 0',
                'server_team' => 2,
                'scheduled_time' => now()->subMinutes(10)->toDateTimeString(),
            ]
        );

        // Match 4: Upcoming Scheduled on Court 3
        TournamentMatch::firstOrCreate(
            ['category_id' => $catBronzeMen->id, 'match_number' => 4],
            [
                'stage' => 'group',
                'group_letter' => 'B',
                'round_name' => 'Grup B Match 1',
                'round_order' => 4,
                'team1_id' => $teams[3]->id, // Ginting/Jojo
                'team2_id' => $teams[1]->id,
                'court_id' => $court3->id,
                'status' => 'pending',
                'scheduled_time' => now()->addMinutes(45)->toDateTimeString(),
            ]
        );

        // 6. Upcoming Tournament: Surabaya Padel Open 2026
        Tournament::firstOrCreate(
            ['slug' => 'surabaya-padel-open-2026'],
            [
                'user_id' => $eoUser->id,
                'name' => 'Surabaya Padel Open 2026',
                'venue_name' => 'Foxy Padel Surabaya',
                'venue_address' => 'Kertajaya Indah Timur No. 88, Surabaya',
                'city_id' => '3578',
                'city_name' => 'KOTA SURABAYA',
                'province_id' => '35',
                'province_name' => 'JAWA TIMUR',
                'start_date' => now()->addDays(12)->toDateString(),
                'end_date' => now()->addDays(14)->toDateString(),
                'registration_deadline' => now()->addDays(9)->toDateString(),
                'status' => 'published',
                'description' => '<p>Kejuaraan terbuka padel terbesar di Jawa Timur. Terbuka untuk kategori Open Men, Women, dan Community Beginner.</p>',
                'registration_guide' => '<p>Slot terbatas! Segera daftarkan pasangan tim Anda sebelum kuota ditutup.</p>',
                'bank_name' => 'Mandiri',
                'bank_account_number' => '1420099887766',
                'bank_account_holder' => 'KOCE Event Organizer',
            ]
        );

        // 7. Completed Tournament: Bali Sunset Masters 2026
        $baliTourney = Tournament::firstOrCreate(
            ['slug' => 'bali-sunset-padel-masters-2026'],
            [
                'user_id' => $eoUser->id,
                'name' => 'Bali Sunset Padel Masters 2026',
                'venue_name' => 'Jungle Padel Canggu',
                'venue_address' => 'Jl. Subak Sari, Canggu, Badung, Bali',
                'city_id' => '5103',
                'city_name' => 'KABUPATEN BADUNG',
                'province_id' => '51',
                'province_name' => 'BALI',
                'start_date' => now()->subDays(20)->toDateString(),
                'end_date' => now()->subDays(18)->toDateString(),
                'registration_deadline' => now()->subDays(25)->toDateString(),
                'status' => 'completed',
                'description' => '<p>Turnamen prestisius bertaraf internasional dengan pesona pemandangan sunset Canggu Bali.</p>',
                'bank_name' => 'BCA',
                'bank_account_number' => '8800112233',
                'bank_account_holder' => 'PT Koceevent Kreasi Sport',
            ]
        );

        // 8. Completed Staging Historical Tournaments for Winners Hub (/winners)
        $stagingWinnersTournaments = [
            [
                'name' => 'Test Turnamen',
                'slug' => 'test-turnamen-2026',
                'date' => '2026-09-30',
                'city' => 'KOTA SURABAYA',
                'province' => 'JAWA TIMUR',
                'div_name' => 'Open',
                'skill_name' => 'Upper Beginner',
                'winner1' => ['name' => 'Muhammad Jamaluddin Afkar', 'email' => 'afkar@padelgigs.id'],
                'winner2' => ['name' => 'Jason Sugihan P.', 'email' => 'jason@padelgigs.id'],
            ],
            [
                'name' => "Let's Padel Mini Tournament Vol. 3",
                'slug' => 'lets-padel-mini-vol-3',
                'date' => '2026-08-09',
                'city' => 'KOTA SURABAYA',
                'province' => 'JAWA TIMUR',
                'div_name' => 'Men',
                'skill_name' => 'Upper Beginner',
                'winner1' => ['name' => 'Yudha Kurniawan', 'email' => 'yudha@padelgigs.id'],
                'winner2' => ['name' => 'Maulana M. Danken Alfikri', 'email' => 'maulana@padelgigs.id'],
            ],
            [
                'name' => 'Pagi Sore Mini Tourney',
                'slug' => 'pagi-sore-mini-tourney',
                'date' => '2026-08-06',
                'city' => 'KOTA SURABAYA',
                'province' => 'JAWA TIMUR',
                'div_name' => 'Men',
                'skill_name' => 'Bronze',
                'winner1' => ['name' => 'Firman Rakhmad Arifiyanto', 'email' => 'firman@padelgigs.id'],
                'winner2' => ['name' => 'Andery styawanto', 'email' => 'andery@padelgigs.id'],
            ],
            [
                'name' => 'BOUNCE & BOND BERSUARIAVOL.02',
                'slug' => 'bounce-and-bond-vol-02',
                'date' => '2026-07-18',
                'city' => 'KOTA SURABAYA',
                'province' => 'JAWA TIMUR',
                'div_name' => 'Men',
                'skill_name' => 'Upper Beginner',
                'winner1' => ['name' => 'hendra laksmana putra', 'email' => 'hendralaks@padelgigs.id'],
                'winner2' => ['name' => 'Malvincent Soewarno', 'email' => 'malvincent@padelgigs.id'],
            ],
            [
                'name' => "LET'S PADEL GRAND OPENING TOURNAMENT",
                'slug' => 'lets-padel-grand-opening',
                'date' => '2026-07-17',
                'city' => 'KOTA SURABAYA',
                'province' => 'JAWA TIMUR',
                'div_name' => 'Open',
                'skill_name' => 'Bronze',
                'winner1' => ['name' => 'candra dauna utama', 'email' => 'candra@padelgigs.id'],
                'winner2' => ['name' => 'raymond oentoeng', 'email' => 'raymond@padelgigs.id'],
            ],
        ];

        foreach ($stagingWinnersTournaments as $item) {
            $t = Tournament::firstOrCreate(
                ['slug' => $item['slug']],
                [
                    'user_id' => $eoUser->id,
                    'name' => $item['name'],
                    'venue_name' => 'Let\'s Padel Club',
                    'venue_address' => 'Jl. Mayjend Sungkono, Surabaya',
                    'city_id' => '3578',
                    'city_name' => $item['city'],
                    'province_id' => '35',
                    'province_name' => $item['province'],
                    'start_date' => $item['date'],
                    'end_date' => $item['date'],
                    'status' => 'completed',
                    'description' => '<p>Turnamen resmi berseri PadelGigs dengan kompetisi ketat dan poin peringkat nasional.</p>',
                ]
            );

            $c = TournamentCategory::firstOrCreate(
                ['tournament_id' => $t->id, 'name' => "{$item['div_name']} - {$item['skill_name']}"],
                [
                    'tier_name' => 'Grand',
                    'division_name' => $item['div_name'],
                    'skill_level_name' => $item['skill_name'],
                    'max_teams' => 16,
                    'registration_fee' => 750000,
                    'format' => 'group_knockout',
                ]
            );

            // Seed user 1 and user 2
            $u1 = User::firstOrCreate(
                ['email' => $item['winner1']['email']],
                [
                    'name' => $item['winner1']['name'],
                    'password' => Hash::make('password'),
                    'city_name' => $item['city'],
                    'skill_level' => $item['skill_name'],
                    'is_active' => true,
                ]
            );
            $u1->syncRoles(['player']);

            $u2 = User::firstOrCreate(
                ['email' => $item['winner2']['email']],
                [
                    'name' => $item['winner2']['name'],
                    'password' => Hash::make('password'),
                    'city_name' => $item['city'],
                    'skill_level' => $item['skill_name'],
                    'is_active' => true,
                ]
            );
            $u2->syncRoles(['player']);

            // Winner Team
            $teamName = explode(' ', $item['winner1']['name'])[0] . ' / ' . explode(' ', $item['winner2']['name'])[0];
            $wTeam = Team::firstOrCreate(
                ['category_id' => $c->id, 'name' => $teamName],
                [
                    'payment_status' => 'verified',
                    'payment_amount' => 750000,
                    'is_checked_in' => true,
                ]
            );

            TeamPlayer::firstOrCreate(
                ['team_id' => $wTeam->id, 'player_order' => 1],
                ['user_id' => $u1->id, 'name' => $u1->name]
            );

            TeamPlayer::firstOrCreate(
                ['team_id' => $wTeam->id, 'player_order' => 2],
                ['user_id' => $u2->id, 'name' => $u2->name]
            );

            // Final Match completed
            TournamentMatch::firstOrCreate(
                ['category_id' => $c->id, 'stage' => 'final'],
                [
                    'round_name' => 'Final',
                    'round_order' => 10,
                    'match_number' => 15,
                    'team1_id' => $wTeam->id,
                    'status' => 'completed',
                    'winner_team_id' => $wTeam->id,
                    'team1_set1_score' => 6,
                    'team2_set1_score' => 3,
                    'scheduled_time' => "{$item['date']} 16:00:00",
                ]
            );
        }
    }
}
