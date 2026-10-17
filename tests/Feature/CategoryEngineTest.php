<?php

namespace Tests\Feature;

use App\Models\Tournament;
use App\Models\TournamentCategory;
use App\Models\Team;
use App\Models\TournamentMatch;
use App\Models\User;
use App\Models\MasterTier;
use App\Models\MasterDivision;
use App\Models\MasterSkillLevel;
use App\Services\StandingsCalculatorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CategoryEngineTest extends TestCase
{
    use RefreshDatabase;

    protected User $organizer;
    protected Tournament $tournament;
    protected TournamentCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'organizer']);

        $this->organizer = User::factory()->create();
        $this->organizer->assignRole('organizer');

        $tier = MasterTier::create(['name' => 'Mini Tournament', 'slug' => 'mini', 'sort_order' => 1]);
        $division = MasterDivision::create(['name' => 'Men', 'slug' => 'men', 'sort_order' => 1]);
        $skill = MasterSkillLevel::create(['name' => 'Beginner', 'slug' => 'beg', 'sort_order' => 1]);

        $this->tournament = Tournament::create([
            'user_id' => $this->organizer->id,
            'name' => 'KOCE Padel Championship 2026',
            'slug' => 'koce-padel-championship-2026',
            'venue_name' => 'KOCE Arena Cilandak',
            'city_id' => '3171',
            'city_name' => 'KOTA JAKARTA SELATAN',
            'province_id' => '31',
            'province_name' => 'DKI JAKARTA',
            'start_date' => now()->addDays(5)->toDateString(),
            'end_date' => now()->addDays(7)->toDateString(),
            'status' => 'draft',
        ]);

        $this->category = TournamentCategory::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Men Beginner',
            'tier_id' => $tier->id,
            'tier_name' => $tier->name,
            'division_id' => $division->id,
            'division_name' => $division->name,
            'skill_level_id' => $skill->id,
            'skill_level_name' => $skill->name,
            'format' => 'group_knockout',
            'group_count' => 2,
            'advancing_per_group' => 2,
            'has_wildcard' => false,
            'has_third_place' => true,
            'knockout_method' => 'cross_group',
            'max_teams' => 8,
            'registration_fee' => 350000,
            'match_rules' => [
                'group_format' => 'race_to_6',
                'golden_point' => true,
            ],
        ]);
    }

    public function test_organizer_can_update_category_configuration(): void
    {
        $response = $this->actingAs($this->organizer)->put(
            route('organizer.categories.configure.update', [$this->tournament->id, $this->category->id]),
            [
                'max_teams' => 16,
                'registration_fee' => 400000,
                'format' => 'group_knockout',
                'group_count' => 4,
                'advancing_per_group' => 2,
                'has_wildcard' => false,
                'has_third_place' => true,
                'knockout_method' => 'cross_group',
                'match_rules' => [
                    'group_format' => 'race_to_4',
                    'golden_point' => false,
                ],
            ]
        );

        $response->assertRedirect();
        $this->assertDatabaseHas('tournament_categories', [
            'id' => $this->category->id,
            'max_teams' => 16,
            'group_count' => 4,
        ]);
    }

    public function test_organizer_can_add_manual_team(): void
    {
        $response = $this->actingAs($this->organizer)->post(
            route('organizer.categories.teams.manual', [$this->tournament->id, $this->category->id]),
            [
                'name' => 'Jason / Budi',
                'player1_name' => 'Jason Sugihan',
                'player1_phone' => '081234567890',
                'player2_name' => 'Budi Santoso',
                'player2_phone' => '081234567891',
                'group_draw_seed' => 1,
            ]
        );

        $response->assertRedirect();
        $this->assertDatabaseHas('teams', [
            'category_id' => $this->category->id,
            'name' => 'Jason / Budi',
            'group_draw_seed' => 1,
        ]);
    }

    public function test_fisher_yates_balanced_draw_isolates_seeded_teams(): void
    {
        // Buat 4 tim (2 seeded, 2 unseeded)
        $team1 = Team::create([
            'category_id' => $this->category->id,
            'name' => 'Seed 1 Team',
            'group_draw_seed' => 1,
            'payment_status' => 'verified',
        ]);
        $team2 = Team::create([
            'category_id' => $this->category->id,
            'name' => 'Seed 2 Team',
            'group_draw_seed' => 2,
            'payment_status' => 'verified',
        ]);
        $team3 = Team::create([
            'category_id' => $this->category->id,
            'name' => 'Regular Team A',
            'payment_status' => 'verified',
        ]);
        $team4 = Team::create([
            'category_id' => $this->category->id,
            'name' => 'Regular Team B',
            'payment_status' => 'verified',
        ]);

        $response = $this->actingAs($this->organizer)->post(
            route('organizer.categories.draw-groups', [$this->tournament->id, $this->category->id]),
            ['group_count' => 2]
        );

        $response->assertRedirect();

        $team1->refresh();
        $team2->refresh();

        // Seed 1 harus di Grup A, Seed 2 harus di Grup B (Seeding Isolation)
        $this->assertEquals('A', $team1->group_letter);
        $this->assertEquals('B', $team2->group_letter);
    }

    public function test_can_generate_round_robin_fixtures_with_berger_tables(): void
    {
        // Buat 4 tim dalam Grup A
        for ($i = 1; $i <= 4; $i++) {
            Team::create([
                'category_id' => $this->category->id,
                'name' => "Team {$i}",
                'group_letter' => 'A',
                'payment_status' => 'verified',
            ]);
        }

        $response = $this->actingAs($this->organizer)->post(
            route('organizer.categories.generate-fixtures', [$this->tournament->id, $this->category->id])
        );

        $response->assertRedirect();

        // 4 tim round-robin = (4 * 3) / 2 = 6 pertandingan
        $this->assertDatabaseCount('matches', 6);
    }

    public function test_can_calculate_standings_and_generate_knockout_bracket(): void
    {
        // 2 tim di Grup A, 2 tim di Grup B
        $teamA1 = Team::create(['category_id' => $this->category->id, 'name' => 'Team A1', 'group_letter' => 'A', 'payment_status' => 'verified']);
        $teamA2 = Team::create(['category_id' => $this->category->id, 'name' => 'Team A2', 'group_letter' => 'A', 'payment_status' => 'verified']);
        $teamB1 = Team::create(['category_id' => $this->category->id, 'name' => 'Team B1', 'group_letter' => 'B', 'payment_status' => 'verified']);
        $teamB2 = Team::create(['category_id' => $this->category->id, 'name' => 'Team B2', 'group_letter' => 'B', 'payment_status' => 'verified']);

        // Match di Grup A: A1 kalahkan A2 (6-2)
        TournamentMatch::create([
            'category_id' => $this->category->id,
            'stage' => 'group',
            'group_letter' => 'A',
            'round_order' => 1,
            'match_number' => 1,
            'team1_id' => $teamA1->id,
            'team2_id' => $teamA2->id,
            'team1_set1_score' => 6,
            'team2_set1_score' => 2,
            'winner_team_id' => $teamA1->id,
            'status' => 'completed',
        ]);

        // Match di Grup B: B1 kalahkan B2 (6-4)
        TournamentMatch::create([
            'category_id' => $this->category->id,
            'stage' => 'group',
            'group_letter' => 'B',
            'round_order' => 1,
            'match_number' => 2,
            'team1_id' => $teamB1->id,
            'team2_id' => $teamB2->id,
            'team1_set1_score' => 6,
            'team2_set1_score' => 4,
            'winner_team_id' => $teamB1->id,
            'status' => 'completed',
        ]);

        $calculator = app(StandingsCalculatorService::class);
        $standings = $calculator->calculateForCategory($this->category);

        $this->assertEquals($teamA1->id, $standings['A'][0]['team_id']);
        $this->assertEquals($teamB1->id, $standings['B'][0]['team_id']);

        // Generate bracket knockout
        $response = $this->actingAs($this->organizer)->post(
            route('organizer.categories.generate-bracket', [$this->tournament->id, $this->category->id])
        );

        $response->assertRedirect();

        // Harusnya ada 4 match (Semi Final 1, Semi Final 2, Perebutan Juara 3, Final)
        $this->assertDatabaseHas('matches', [
            'category_id' => $this->category->id,
            'stage' => 'knockout',
            'round_name' => 'Semi Final',
            'team1_id' => $teamA1->id,
            'team2_id' => $teamB2->id,
        ]);
        $this->assertDatabaseHas('matches', [
            'category_id' => $this->category->id,
            'stage' => 'knockout',
            'round_name' => 'Semi Final',
            'team1_id' => $teamB1->id,
            'team2_id' => $teamA2->id,
        ]);
        $this->assertDatabaseHas('matches', [
            'category_id' => $this->category->id,
            'stage' => 'knockout',
            'round_name' => 'Final',
        ]);
        $this->assertDatabaseHas('matches', [
            'category_id' => $this->category->id,
            'stage' => 'knockout',
            'round_name' => 'Perebutan Juara 3',
        ]);
    }
}
