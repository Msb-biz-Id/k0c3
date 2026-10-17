<?php

namespace Tests\Feature;

use App\Models\Court;
use App\Models\MasterDivision;
use App\Models\MasterSkillLevel;
use App\Models\MasterTier;
use App\Models\Tournament;
use App\Models\TournamentCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class OrganizerTournamentTest extends TestCase
{
    use RefreshDatabase;

    protected User $eo;
    protected User $player;
    protected MasterTier $tier;
    protected MasterDivision $division;
    protected MasterSkillLevel $skill;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'organizer']);
        Role::firstOrCreate(['name' => 'player']);

        $this->eo = User::factory()->create([
            'name' => 'KOCE Organizer',
            'email' => 'koce_test@padelgigs.id',
        ]);
        $this->eo->assignRole('organizer');

        $this->player = User::factory()->create([
            'name' => 'Normal Player',
            'email' => 'player_test@padelgigs.id',
        ]);
        $this->player->assignRole('player');

        $this->tier = MasterTier::create([
            'name' => 'Grand Tournament',
            'slug' => 'grand-tournament',
            'is_active' => true,
        ]);

        $this->division = MasterDivision::create([
            'name' => 'Men Division',
            'slug' => 'men-division',
            'gender_restriction' => 'male',
            'is_active' => true,
        ]);

        $this->skill = MasterSkillLevel::create([
            'name' => 'Intermediate Level',
            'slug' => 'intermediate-level',
            'min_rating' => 3.5,
            'max_rating' => 4.4,
            'is_active' => true,
        ]);
    }

    public function test_player_cannot_access_organizer_dashboard(): void
    {
        $response = $this->actingAs($this->player)->get('/organizer/tournaments');
        $response->assertStatus(403);
    }

    public function test_eo_can_view_tournaments_index_and_create(): void
    {
        $responseIndex = $this->actingAs($this->eo)->get('/organizer/tournaments');
        $responseIndex->assertStatus(200);

        $responseCreate = $this->actingAs($this->eo)->get('/organizer/tournaments/create');
        $responseCreate->assertStatus(200);
    }

    public function test_eo_can_create_tournament_with_categories_and_courts(): void
    {
        $payload = [
            'name' => 'Padel Fun Masters 2026',
            'sport_type' => 'padel',
            'description' => 'Turnamen seru padel di Jakarta Selatan',
            'venue_name' => 'Padelibre Kemang',
            'venue_address' => 'Jl. Kemang Raya No. 10',
            'start_date' => now()->addDays(5)->toDateString(),
            'end_date' => now()->addDays(6)->toDateString(),
            'bank_name' => 'BCA',
            'bank_account_number' => '8881234567',
            'bank_account_holder' => 'KOCE Event Management',
            'categories' => [
                [
                    'name' => 'Men Intermediate Pro',
                    'tier_id' => $this->tier->id,
                    'division_id' => $this->division->id,
                    'skill_level_id' => $this->skill->id,
                    'max_teams' => 12,
                    'registration_fee' => 400000,
                    'format' => 'group_knockout',
                    'is_open_registration' => true,
                ],
            ],
            'courts' => [
                ['name' => 'Court Barat', 'surface_type' => 'panoramic_turf'],
                ['name' => 'Court Timur', 'surface_type' => 'panoramic_turf'],
            ],
        ];

        $response = $this->actingAs($this->eo)->post('/organizer/tournaments', $payload);

        $tournament = Tournament::where('name', 'Padel Fun Masters 2026')->first();
        $this->assertNotNull($tournament);
        $response->assertRedirect(route('organizer.tournaments.show', $tournament->id));

        // Verify Snapshot Integrity
        $category = TournamentCategory::where('tournament_id', $tournament->id)->first();
        $this->assertNotNull($category);
        $this->assertEquals('Grand Tournament', $category->tier_name);
        $this->assertEquals('Men Division', $category->division_name);
        $this->assertEquals('Intermediate Level', $category->skill_level_name);

        // Verify Courts & Auto-Generated Referee Tokens & PINs
        $courts = Court::where('tournament_id', $tournament->id)->get();
        $this->assertCount(2, $courts);
        foreach ($courts as $court) {
            $this->assertNotEmpty($court->referee_token);
            $this->assertNotEmpty($court->referee_pin);
        }
    }

    public function test_eo_can_publish_tournament(): void
    {
        $tournament = Tournament::create([
            'user_id' => $this->eo->id,
            'name' => 'Draft Tourney',
            'slug' => 'draft-tourney',
            'sport_type' => 'padel',
            'venue_name' => 'Padel Court',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
            'bank_name' => 'BCA',
            'bank_account_number' => '123',
            'bank_account_holder' => 'EO',
            'status' => 'draft',
        ]);

        TournamentCategory::create([
            'tournament_id' => $tournament->id,
            'name' => 'Open Category',
            'max_teams' => 8,
            'registration_fee' => 200000,
            'format' => 'knockout_only',
        ]);

        $response = $this->actingAs($this->eo)->patch("/organizer/tournaments/{$tournament->id}/publish");
        $response->assertRedirect();
        $this->assertEquals('published', $tournament->fresh()->status);
    }
}
