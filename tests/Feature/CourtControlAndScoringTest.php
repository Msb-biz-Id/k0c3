<?php

namespace Tests\Feature;

use App\Models\Court;
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

class CourtControlAndScoringTest extends TestCase
{
    use RefreshDatabase;

    protected User $organizer;
    protected Tournament $tournament;
    protected TournamentCategory $category;
    protected Court $court;
    protected Team $team1;
    protected Team $team2;
    protected TournamentMatch $match;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'organizer']);

        $this->organizer = User::factory()->create();
        $this->organizer->assignRole('organizer');

        $tier = MasterTier::create(['name' => 'Grand', 'slug' => 'grand', 'sort_order' => 1]);
        $division = MasterDivision::create(['name' => 'Men', 'slug' => 'men', 'sort_order' => 1]);
        $skill = MasterSkillLevel::create(['name' => 'Intermediate', 'slug' => 'intermediate', 'sort_order' => 1]);

        $this->tournament = Tournament::create([
            'user_id' => $this->organizer->id,
            'name' => 'Padel Masters Jakarta 2026',
            'slug' => 'padel-masters-jakarta-2026',
            'venue_name' => 'Kemang Padel Club',
            'city_id' => '3171',
            'city_name' => 'KOTA JAKARTA SELATAN',
            'province_id' => '31',
            'province_name' => 'DKI JAKARTA',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
            'status' => 'ongoing',
        ]);

        $this->category = TournamentCategory::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Men Intermediate',
            'tier_id' => $tier->id,
            'tier_name' => $tier->name,
            'division_id' => $division->id,
            'division_name' => $division->name,
            'skill_level_id' => $skill->id,
            'skill_level_name' => $skill->name,
            'format' => 'knockout_only',
            'max_teams' => 4,
            'registration_fee' => 500000,
        ]);

        $this->court = Court::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Lapangan 1 Center Court',
            'surface_type' => 'panoramic_turf',
            'referee_token' => 'TEST-REFX',
            'referee_pin' => '9988',
        ]);

        $this->team1 = Team::create([
            'category_id' => $this->category->id,
            'name' => 'Budi / Joko',
            'payment_status' => 'pending',
            'payment_amount' => 500000,
            'is_checked_in' => false,
        ]);

        $this->team2 = Team::create([
            'category_id' => $this->category->id,
            'name' => 'Andi / Rama',
            'payment_status' => 'pending',
            'payment_amount' => 500000,
            'is_checked_in' => false,
        ]);

        $this->match = TournamentMatch::create([
            'category_id' => $this->category->id,
            'stage' => 'knockout',
            'round_name' => 'Final',
            'round_order' => 1,
            'match_number' => 1,
            'team1_id' => $this->team1->id,
            'team2_id' => $this->team2->id,
            'court_id' => $this->court->id,
            'status' => 'pending',
        ]);
    }

    public function test_organizer_can_view_court_control_board(): void
    {
        $response = $this->actingAs($this->organizer)->get(
            route('organizer.tournaments.court-control', $this->tournament->id)
        );

        $response->assertOk();
    }

    public function test_organizer_can_update_match_status_and_declare_winner(): void
    {
        $response = $this->actingAs($this->organizer)->post(
            route('organizer.tournaments.court-control.status', [$this->tournament->id, $this->match->id]),
            [
                'status' => 'completed',
                'winner_team_id' => $this->team1->id,
                'team1_set1_score' => 6,
                'team2_set1_score' => 4,
            ]
        );

        $response->assertRedirect();
        $this->assertDatabaseHas('matches', [
            'id' => $this->match->id,
            'status' => 'completed',
            'winner_team_id' => $this->team1->id,
            'team1_set1_score' => 6,
            'team2_set1_score' => 4,
        ]);

        // Verifikasi score audit log tercatat
        $this->assertDatabaseHas('score_logs', [
            'match_id' => $this->match->id,
            'action_type' => 'status_change',
        ]);
    }

    public function test_anonymous_referee_can_access_terminal_with_court_token(): void
    {
        $response = $this->get(route('referee.scoring', $this->court->referee_token));
        $response->assertOk();
    }

    public function test_referee_can_start_match_and_update_live_score(): void
    {
        // 1. Mulai match
        $startResponse = $this->post(
            route('referee.matches.start', [$this->court->referee_token, $this->match->id])
        );
        $startResponse->assertRedirect();

        $this->assertDatabaseHas('matches', [
            'id' => $this->match->id,
            'status' => 'in_progress',
        ]);

        // 2. Update skor game live
        $scoreResponse = $this->post(
            route('referee.matches.score', [$this->court->referee_token, $this->match->id]),
            [
                'team1_set1_score' => 3,
                'team2_set1_score' => 2,
                'current_game_score' => '40 - 15',
                'server_team' => 1,
            ]
        );
        $scoreResponse->assertRedirect();

        $this->assertDatabaseHas('matches', [
            'id' => $this->match->id,
            'team1_set1_score' => 3,
            'team2_set1_score' => 2,
            'current_game_score' => '40 - 15',
        ]);
    }

    public function test_organizer_can_toggle_player_check_in_and_verify_payment(): void
    {
        // 1. Toggle check-in
        $checkInResponse = $this->actingAs($this->organizer)->post(
            route('organizer.tournaments.check-in.toggle', [$this->tournament->id, $this->team1->id])
        );
        $checkInResponse->assertRedirect();

        $this->assertDatabaseHas('teams', [
            'id' => $this->team1->id,
            'is_checked_in' => 1,
        ]);

        // 2. Verify payment
        $paymentResponse = $this->actingAs($this->organizer)->post(
            route('organizer.tournaments.check-in.payment', [$this->tournament->id, $this->team1->id]),
            ['payment_status' => 'verified']
        );
        $paymentResponse->assertRedirect();

        $this->assertDatabaseHas('teams', [
            'id' => $this->team1->id,
            'payment_status' => 'verified',
        ]);
    }

    public function test_can_generate_pdf_match_sheet(): void
    {
        $response = $this->actingAs($this->organizer)->get(
            route('organizer.tournaments.matches.pdf', [$this->tournament->id, $this->match->id])
        );

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', $response->headers->get('Content-Type'));
    }

    public function test_organizer_can_call_players_via_whatsapp(): void
    {
        \Illuminate\Support\Facades\Queue::fake();

        \App\Models\TeamPlayer::create([
            'team_id' => $this->team1->id,
            'name' => 'Budi Santoso',
            'phone' => '081234567890',
            'player_order' => 1,
        ]);

        $response = $this->actingAs($this->organizer)->post(
            route('organizer.tournaments.court-control.call', [$this->tournament->id, $this->match->id])
        );

        $response->assertRedirect();
        \Illuminate\Support\Facades\Queue::assertPushed(\App\Jobs\SendWhatsAppMessageJob::class);
    }
}
