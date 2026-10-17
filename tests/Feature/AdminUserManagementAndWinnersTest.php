<?php

namespace Tests\Feature;

use App\Models\Tournament;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminUserManagementAndWinnersTest extends TestCase
{
    use RefreshDatabase;

    protected User $superadmin;
    protected User $organizer;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'superadmin']);
        Role::firstOrCreate(['name' => 'organizer']);
        Role::firstOrCreate(['name' => 'player']);

        $this->superadmin = User::factory()->create();
        $this->superadmin->assignRole('superadmin');

        $this->organizer = User::factory()->create();
        $this->organizer->assignRole('organizer');
    }

    public function test_superadmin_can_view_user_management(): void
    {
        $response = $this->actingAs($this->superadmin)->get(route('admin.users.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users/Index')
            ->has('users.data')
            ->has('roles')
        );
    }

    public function test_superadmin_can_update_user_role(): void
    {
        $user = User::factory()->create();
        $user->assignRole('player');

        $response = $this->actingAs($this->superadmin)->patch(
            route('admin.users.update-role', $user->id),
            ['role' => 'organizer']
        );

        $response->assertRedirect();
        $this->assertTrue($user->fresh()->hasRole('organizer'));
    }

    public function test_superadmin_can_toggle_user_status(): void
    {
        $user = User::factory()->create(['is_active' => true]);

        $response = $this->actingAs($this->superadmin)->patch(
            route('admin.users.toggle-status', $user->id)
        );

        $response->assertRedirect();
        $this->assertFalse((bool) $user->fresh()->is_active);
    }

    public function test_non_superadmin_cannot_access_user_management(): void
    {
        $response = $this->actingAs($this->organizer)->get(route('admin.users.index'));
        $response->assertStatus(403);
    }

    public function test_public_can_view_winners_hall_of_fame(): void
    {
        $tournament = Tournament::create([
            'user_id' => $this->organizer->id,
            'name' => 'Championship Open',
            'slug' => 'championship-open',
            'sport_type' => 'padel',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
            'venue_name' => 'Arena Center',
            'status' => 'completed',
        ]);

        $category = TournamentCategory::create([
            'tournament_id' => $tournament->id,
            'name' => 'Open Men',
            'max_teams' => 8,
            'registration_fee' => 200000,
            'format' => 'knockout',
        ]);

        $team1 = Team::create(['category_id' => $category->id, 'name' => 'Juara Padel']);
        $team2 = Team::create(['category_id' => $category->id, 'name' => 'Runner Up Padel']);

        $match = TournamentMatch::create([
            'category_id' => $category->id,
            'team1_id' => $team1->id,
            'team2_id' => $team2->id,
            'winner_team_id' => $team1->id,
            'match_number' => 'FINAL',
            'stage' => 'final',
            'round_order' => 1,
            'status' => 'completed',
        ]);

        $player1 = \App\Models\TeamPlayer::create([
            'team_id' => $team1->id,
            'player_order' => 1,
            'name' => 'Budi Santoso',
        ]);

        $response = $this->get(route('winners'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Winners')
            ->has('winners.data', 1)
            ->has('skillLevelOptions')
            ->has('winnerScopeOptions')
            ->has('filters')
        );
    }
}
