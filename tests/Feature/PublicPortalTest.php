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
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PublicPortalTest extends TestCase
{
    use RefreshDatabase;

    protected User $organizer;
    protected Tournament $tournament;
    protected TournamentCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'organizer']);
        Role::firstOrCreate(['name' => 'player']);

        $this->organizer = User::factory()->create();
        $this->organizer->assignRole('organizer');

        $tier = MasterTier::create(['name' => 'Open', 'slug' => 'open', 'sort_order' => 1]);
        $division = MasterDivision::create(['name' => 'Men', 'slug' => 'men', 'sort_order' => 1]);
        $skill = MasterSkillLevel::create(['name' => 'Intermediate', 'slug' => 'intermediate', 'sort_order' => 1]);

        $this->tournament = Tournament::create([
            'user_id' => $this->organizer->id,
            'name' => 'Jakarta Padel Open 2026',
            'slug' => 'jakarta-padel-open-2026',
            'venue_name' => 'Verde Padel Club',
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
            'name' => 'Men Open',
            'tier_id' => $tier->id,
            'tier_name' => $tier->name,
            'division_id' => $division->id,
            'division_name' => $division->name,
            'skill_level_id' => $skill->id,
            'skill_level_name' => $skill->name,
            'format' => 'group_knockout',
            'max_teams' => 8,
            'registration_fee' => 450000,
        ]);
    }

    public function test_homepage_loads_successfully_with_tournament_directory(): void
    {
        $response = $this->get(route('home'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Welcome')
            ->has('tournaments.data')
            ->has('liveMatches')
            ->has('topAthletes')
        );
    }

    public function test_homepage_filter_by_search_keyword(): void
    {
        $response = $this->get(route('home', ['search' => 'Jakarta Padel']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('tournaments.total', 1)
        );
    }

    public function test_public_single_tournament_page_loads_with_6_tab_data(): void
    {
        $response = $this->get(route('tournaments.show', $this->tournament->slug));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Tournaments/Show')
            ->has('tournament')
            ->has('matches')
            ->has('standingsByCategory')
        );
    }

    public function test_tv_kiosk_slideshow_mode_loads_successfully(): void
    {
        $response = $this->get(route('tournaments.slideshow', $this->tournament->slug));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Tournaments/Slideshow')
            ->has('tournament')
            ->has('liveMatches')
            ->has('upcomingMatches')
            ->has('standingsByCategory')
        );
    }

    public function test_dedicated_tournaments_index_page_loads_with_filters(): void
    {
        $response = $this->get('/tournaments?tab=upcoming');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Tournaments/Index')
            ->has('tournaments.data')
            ->where('filters.tab', 'upcoming')
        );
    }

    public function test_leaderboard_page_loads_with_ranked_players(): void
    {
        $response = $this->get('/leaderboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Leaderboard/Index')
            ->has('players')
            ->where('filters.gender', 'all')
        );

        $responseAlias = $this->get('/players');
        $responseAlias->assertOk();
    }

    public function test_player_profile_page_loads_with_radar_and_history(): void
    {
        $player = User::factory()->create([
            'name' => 'Bambang Padel',
            'dominant_hand' => 'right',
        ]);
        $player->assignRole('player');

        $this->get('/players/' . $player->id)
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Players/Show')
                ->has('player')
                ->has('stats')
                ->has('radarAttributes')
            );

        // Verify /leaderboard/{id} alias also loads the same player profile
        $this->get('/leaderboard/' . $player->id)
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Public/Players/Show')
                ->where('player.name', 'Bambang Padel')
            );
    }

    public function test_global_search_api_returns_json_results(): void
    {
        $response = $this->get('/api/search?q=Jakarta');

        $response->assertOk();
        $response->assertJsonStructure([
            'tournaments',
            'players',
            'blogs',
        ]);
    }

    public function test_indonesia_regions_api_returns_provinces_and_cities(): void
    {
        $resProvinces = $this->get(route('api.regions.provinces'));
        $resProvinces->assertOk();
        $resProvinces->assertJsonStructure([
            'status',
            'data' => [
                '*' => ['id', 'code', 'name'],
            ],
        ]);

        $resCities = $this->get(route('api.regions.cities', '31'));
        $resCities->assertOk();
        $resCities->assertJsonStructure([
            'status',
            'data',
        ]);
    }
}
