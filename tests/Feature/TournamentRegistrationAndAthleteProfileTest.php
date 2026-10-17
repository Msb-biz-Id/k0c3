<?php

namespace Tests\Feature;

use App\Models\Tournament;
use App\Models\TournamentCategory;
use App\Models\Team;
use App\Models\TeamPlayer;
use App\Models\User;
use App\Models\MasterTier;
use App\Models\MasterDivision;
use App\Models\MasterSkillLevel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class TournamentRegistrationAndAthleteProfileTest extends TestCase
{
    use RefreshDatabase;

    protected User $organizer;
    protected User $player;
    protected Tournament $tournament;
    protected TournamentCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'organizer']);
        Role::firstOrCreate(['name' => 'player']);

        $this->organizer = User::factory()->create();
        $this->organizer->assignRole('organizer');

        $this->player = User::factory()->create([
            'name' => 'Jason Sugihan',
            'phone' => '081234567890',
            'dominant_hand' => 'right',
        ]);
        $this->player->assignRole('player');

        $tier = MasterTier::create(['name' => 'Mini', 'slug' => 'mini', 'sort_order' => 1]);
        $division = MasterDivision::create(['name' => 'Men', 'slug' => 'men', 'sort_order' => 1]);
        $skill = MasterSkillLevel::create(['name' => 'Beginner', 'slug' => 'beginner', 'sort_order' => 1]);

        $this->tournament = Tournament::create([
            'user_id' => $this->organizer->id,
            'name' => 'KOCE Beginner Cup 2026',
            'slug' => 'koce-beginner-cup-2026',
            'venue_name' => 'KOCE Arena',
            'city_id' => '3171',
            'city_name' => 'KOTA JAKARTA SELATAN',
            'province_id' => '31',
            'province_name' => 'DKI JAKARTA',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
            'status' => 'published',
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
            'max_teams' => 8,
            'registration_fee' => 350000,
        ]);
    }

    public function test_athlete_profile_page_loads_with_radar_and_history(): void
    {
        $response = $this->get(route('players.show', $this->player->id));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Players/Show')
            ->has('player')
            ->has('stats')
            ->has('radarAttributes')
            ->has('matchHistory')
        );
    }

    public function test_registration_wizard_page_loads_with_categories(): void
    {
        $response = $this->actingAs($this->player)->get(
            route('tournaments.register', $this->tournament->slug)
        );

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Tournaments/Register')
            ->has('tournament.categories')
        );
    }

    public function test_player_can_submit_registration_with_receipt(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('transfer_receipt.jpg');

        $response = $this->actingAs($this->player)->post(
            route('tournaments.register.store', $this->tournament->slug),
            [
                'category_id' => $this->category->id,
                'team_name' => 'Jason & Hendra',
                'p1_name' => 'Jason Sugihan',
                'p1_phone' => '081234567890',
                'p1_email' => 'jason@example.com',
                'p1_jersey_size' => 'L',
                'p2_name' => 'Hendra Setiawan',
                'p2_phone' => '081234567899',
                'p2_email' => 'hendra@example.com',
                'p2_jersey_size' => 'XL',
                'payment_receipt' => $file,
            ]
        );

        $response->assertRedirect(route('tournaments.show', $this->tournament->slug));

        $this->assertDatabaseHas('teams', [
            'category_id' => $this->category->id,
            'name' => 'Jason & Hendra',
            'payment_status' => 'pending',
        ]);

        $this->assertDatabaseHas('team_players', [
            'name' => 'Jason Sugihan',
            'jersey_size' => 'L',
        ]);

        $this->assertDatabaseHas('team_players', [
            'name' => 'Hendra Setiawan',
            'jersey_size' => 'XL',
        ]);

        $team = Team::where('name', 'Jason & Hendra')->first();
        $this->assertNotNull($team->payment_receipt_url);
        $this->assertTrue(Storage::disk('public')->exists($team->payment_receipt_url));
    }
}
