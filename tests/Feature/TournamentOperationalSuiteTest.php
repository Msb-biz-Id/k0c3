<?php

namespace Tests\Feature;

use App\Models\Court;
use App\Models\MasterDivision;
use App\Models\MasterSkillLevel;
use App\Models\MasterTier;
use App\Models\PayoutRequest;
use App\Models\ScoreLog;
use App\Models\Team;
use App\Models\TeamPlayer;
use App\Models\Tournament;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class TournamentOperationalSuiteTest extends TestCase
{
    use RefreshDatabase;

    protected User $organizer;
    protected Tournament $tournament;
    protected TournamentCategory $category;
    protected Court $court1;
    protected Court $court2;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'superadmin']);
        Role::firstOrCreate(['name' => 'organizer']);
        Role::firstOrCreate(['name' => 'player']);

        $this->organizer = User::factory()->create();
        $this->organizer->assignRole('organizer');

        $this->tournament = Tournament::create([
            'user_id' => $this->organizer->id,
            'name' => 'Padel Jakarta Open 2026',
            'slug' => 'padel-jakarta-open-2026',
            'sport_type' => 'padel',
            'venue_name' => 'Kemang Padel Club',
            'start_date' => '2026-11-01',
            'end_date' => '2026-11-03',
            'status' => 'published',
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'PT Koceevent Kreasi Sport',
        ]);

        $this->category = TournamentCategory::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Men Intermediate',
            'max_teams' => 8,
            'registration_fee' => 500000,
            'format' => 'group_knockout',
            'group_count' => 2,
            'advancing_per_group' => 2,
        ]);

        $this->court1 = Court::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Court 1',
            'surface_type' => 'panoramic_turf',
            'referee_token' => 'court-1-token-1234567890abcdef',
            'referee_pin' => '1234',
            'is_active' => true,
        ]);

        $this->court2 = Court::create([
            'tournament_id' => $this->tournament->id,
            'name' => 'Court 2',
            'surface_type' => 'panoramic_turf',
            'referee_token' => 'court-2-token-1234567890abcdef',
            'referee_pin' => '5678',
            'is_active' => true,
        ]);
    }

    public function test_organizer_can_view_schedule_matrix(): void
    {
        $response = $this->actingAs($this->organizer)
            ->get(route('organizer.tournaments.schedule', $this->tournament->id));

        $response->assertOk();
    }

    public function test_organizer_can_assign_and_unassign_match_schedule(): void
    {
        $team1 = Team::create(['category_id' => $this->category->id, 'name' => 'Team A']);
        $team2 = Team::create(['category_id' => $this->category->id, 'name' => 'Team B']);

        $match = TournamentMatch::create([
            'category_id' => $this->category->id,
            'stage' => 'group',
            'round_name' => 'Group Stage',
            'round_order' => 1,
            'match_number' => 1,
            'team1_id' => $team1->id,
            'team2_id' => $team2->id,
            'status' => 'pending',
        ]);

        // Assign match to court 1
        $assignResponse = $this->actingAs($this->organizer)
            ->post(route('organizer.tournaments.schedule.assign', $this->tournament->id), [
                'match_id' => $match->id,
                'court_id' => $this->court1->id,
                'scheduled_time' => '2026-11-01 09:00:00',
            ]);

        $assignResponse->assertRedirect();
        $this->assertDatabaseHas('matches', [
            'id' => $match->id,
            'court_id' => $this->court1->id,
        ]);

        // Unassign match
        $unassignResponse = $this->actingAs($this->organizer)
            ->post(route('organizer.tournaments.schedule.unassign', $this->tournament->id), [
                'match_id' => $match->id,
            ]);

        $unassignResponse->assertRedirect();
        $this->assertDatabaseHas('matches', [
            'id' => $match->id,
            'court_id' => null,
            'scheduled_time' => null,
        ]);
    }

    public function test_organizer_can_auto_schedule_matches(): void
    {
        $team1 = Team::create(['category_id' => $this->category->id, 'name' => 'Team 1']);
        $team2 = Team::create(['category_id' => $this->category->id, 'name' => 'Team 2']);
        $team3 = Team::create(['category_id' => $this->category->id, 'name' => 'Team 3']);
        $team4 = Team::create(['category_id' => $this->category->id, 'name' => 'Team 4']);

        TournamentMatch::create([
            'category_id' => $this->category->id,
            'stage' => 'group',
            'round_name' => 'Group Stage',
            'round_order' => 1,
            'match_number' => 1,
            'team1_id' => $team1->id,
            'team2_id' => $team2->id,
        ]);

        TournamentMatch::create([
            'category_id' => $this->category->id,
            'stage' => 'group',
            'round_name' => 'Group Stage',
            'round_order' => 1,
            'match_number' => 2,
            'team1_id' => $team3->id,
            'team2_id' => $team4->id,
        ]);

        $response = $this->actingAs($this->organizer)
            ->post(route('organizer.tournaments.schedule.auto', $this->tournament->id), [
                'start_date' => '2026-11-01',
                'start_time' => '08:00',
                'interval_minutes' => 45,
                'court_ids' => [$this->court1->id, $this->court2->id],
            ]);

        $response->assertRedirect();
        $this->assertEquals(0, TournamentMatch::whereNull('scheduled_time')->count());
    }

    public function test_organizer_can_manage_courts_and_tokens(): void
    {
        $response = $this->actingAs($this->organizer)
            ->get(route('organizer.tournaments.courts', $this->tournament->id));

        $response->assertOk();

        // Create new court
        $createResponse = $this->actingAs($this->organizer)
            ->post(route('organizer.tournaments.courts.store', $this->tournament->id), [
                'name' => 'Court 3 (Show Court)',
                'surface_type' => 'panoramic_turf',
                'referee_pin' => '4321',
            ]);

        $createResponse->assertRedirect();
        $this->assertDatabaseHas('courts', [
            'name' => 'Court 3 (Show Court)',
            'referee_pin' => '4321',
        ]);

        $newCourt = Court::where('name', 'Court 3 (Show Court)')->first();

        // Regenerate Token
        $regenResponse = $this->actingAs($this->organizer)
            ->post(route('organizer.tournaments.courts.regenerate', [$this->tournament->id, $newCourt->id]));

        $regenResponse->assertRedirect();
        $this->assertNotEquals('4321', $newCourt->fresh()->referee_pin);
    }

    public function test_organizer_can_manage_registrations_and_verify(): void
    {
        $team = Team::create([
            'category_id' => $this->category->id,
            'name' => 'Andi & Budi',
            'payment_status' => 'pending',
            'payment_amount' => 500000,
        ]);

        TeamPlayer::create([
            'team_id' => $team->id,
            'player_order' => 1,
            'name' => 'Andi',
            'phone' => '081234567890',
        ]);

        // View registrations
        $viewResponse = $this->actingAs($this->organizer)
            ->get(route('organizer.tournaments.registrations', $this->tournament->id));

        $viewResponse->assertOk();

        // Approve registration
        $approveResponse = $this->actingAs($this->organizer)
            ->post(route('organizer.tournaments.registrations.status', [$this->tournament->id, $team->id]), [
                'status' => 'verified',
            ]);

        $approveResponse->assertRedirect();
        $this->assertDatabaseHas('teams', [
            'id' => $team->id,
            'payment_status' => 'verified',
        ]);
        $this->assertNotNull($team->fresh()->payment_verified_at);
    }

    public function test_organizer_can_view_score_logs(): void
    {
        $team1 = Team::create(['category_id' => $this->category->id, 'name' => 'Team A']);
        $team2 = Team::create(['category_id' => $this->category->id, 'name' => 'Team B']);

        $match = TournamentMatch::create([
            'category_id' => $this->category->id,
            'stage' => 'group',
            'round_name' => 'Quarter Final',
            'round_order' => 1,
            'match_number' => 1,
            'team1_id' => $team1->id,
            'team2_id' => $team2->id,
        ]);

        ScoreLog::create([
            'match_id' => $match->id,
            'user_id' => $this->organizer->id,
            'court_name' => 'Court 1',
            'previous_score' => '15 - 0',
            'new_score' => '30 - 0',
            'action_type' => 'point_update',
        ]);

        $response = $this->actingAs($this->organizer)
            ->get(route('organizer.tournaments.score-logs', $this->tournament->id));

        $response->assertOk();
    }

    public function test_organizer_can_configure_category_rulebook(): void
    {
        $viewResponse = $this->actingAs($this->organizer)
            ->get(route('organizer.categories.rules', [$this->tournament->id, $this->category->id]));

        $viewResponse->assertOk();

        $updateResponse = $this->actingAs($this->organizer)
            ->put(route('organizer.categories.rules.update', [$this->tournament->id, $this->category->id]), [
                'preset' => 'fip_official',
                'rulebook_text' => 'Regulasi resmi turnamen padel FIP.',
                'warmup_duration_minutes' => 5,
                'walkover_grace_minutes' => 15,
                'super_tiebreak_points' => 10,
                'golden_point_enabled' => true,
            ]);

        $updateResponse->assertRedirect();
        $this->assertEquals('fip_official', $this->category->fresh()->match_rules['preset']);
    }

    public function test_organizer_can_view_income_and_request_payout(): void
    {
        // Add 2 verified teams
        Team::create([
            'category_id' => $this->category->id,
            'name' => 'Tim 1',
            'payment_status' => 'verified',
            'payment_amount' => 500000,
        ]);
        Team::create([
            'category_id' => $this->category->id,
            'name' => 'Tim 2',
            'payment_status' => 'verified',
            'payment_amount' => 500000,
        ]);

        $viewResponse = $this->actingAs($this->organizer)
            ->get(route('organizer.income.index'));

        $viewResponse->assertOk();

        // Submit payout request
        $payoutResponse = $this->actingAs($this->organizer)
            ->post(route('organizer.income.payout'), [
                'tournament_id' => $this->tournament->id,
                'amount' => 500000,
                'bank_name' => 'BCA',
                'bank_account_number' => '1234567890',
                'bank_account_holder' => 'PT Koceevent Kreasi Sport',
            ]);

        $payoutResponse->assertRedirect();
        $this->assertDatabaseHas('payout_requests', [
            'tournament_id' => $this->tournament->id,
            'net_amount' => 500000,
            'status' => 'pending',
        ]);
    }

    public function test_player_can_register_via_dedicated_athlete_portal(): void
    {
        $response = $this->get(route('register.player'));
        $response->assertOk();

        $registerResponse = $this->post(route('register.player.store'), [
            'name' => 'Rafael Athlete',
            'email' => 'rafael.padel@example.com',
            'password' => 'Secret1234!',
            'password_confirmation' => 'Secret1234!',
            'phone' => '081299887766',
            'gender' => 'male',
            'skill_level' => 'Intermediate',
            'preferred_side' => 'left',
            'dominant_hand' => 'right',
            'playtomic_rating' => 3.5,
            'city_name' => 'Jakarta Selatan',
            'bio' => 'Aggressive net player.',
        ]);

        $registerResponse->assertRedirect(route('leaderboard'));
        $this->assertDatabaseHas('users', [
            'email' => 'rafael.padel@example.com',
            'preferred_side' => 'left',
            'dominant_hand' => 'right',
        ]);

        $playerUser = User::where('email', 'rafael.padel@example.com')->first();
        $this->assertTrue($playerUser->hasRole('player'));
    }

    public function test_athlete_can_update_padel_profile_attributes(): void
    {
        $athlete = User::factory()->create([
            'skill_level' => 'Beginner',
            'preferred_side' => 'left',
            'dominant_hand' => 'right',
        ]);

        $response = $this->actingAs($athlete)
            ->patch(route('profile.update'), [
                'name' => 'Updated Athlete Name',
                'email' => $athlete->email,
                'phone' => '089988776655',
                'gender' => 'male',
                'skill_level' => 'Advanced',
                'preferred_side' => 'right',
                'dominant_hand' => 'ambidextrous',
                'playtomic_rating' => 4.8,
                'city_name' => 'Surabaya',
                'bio' => 'Experienced tournament champion.',
            ]);

        $response->assertRedirect(route('profile.edit'));
        $this->assertDatabaseHas('users', [
            'id' => $athlete->id,
            'name' => 'Updated Athlete Name',
            'skill_level' => 'Advanced',
            'preferred_side' => 'right',
            'dominant_hand' => 'ambidextrous',
            'city_name' => 'Surabaya',
        ]);
    }

    public function test_referee_scoring_dispatches_broadcast_event(): void
    {
        \Illuminate\Support\Facades\Event::fake([
            \App\Events\MatchScoreUpdated::class,
        ]);

        $team1 = Team::create(['category_id' => $this->category->id, 'name' => 'Team Alpha']);
        $team2 = Team::create(['category_id' => $this->category->id, 'name' => 'Team Beta']);

        $match = TournamentMatch::create([
            'category_id' => $this->category->id,
            'court_id' => $this->court1->id,
            'stage' => 'group',
            'round_name' => 'Group Match',
            'team1_id' => $team1->id,
            'team2_id' => $team2->id,
            'status' => 'in_progress',
        ]);

        $response = $this->post(route('referee.matches.score', [$this->court1->referee_token, $match->id]), [
            'team1_set1_score' => 4,
            'team2_set1_score' => 2,
            'current_game_score' => '40 - 15',
            'server_team' => 1,
        ]);

        $response->assertRedirect();
        \Illuminate\Support\Facades\Event::assertDispatched(\App\Events\MatchScoreUpdated::class, function ($event) use ($match) {
            return $event->match->id === $match->id;
        });
    }

    public function test_registration_verification_dispatches_whatsapp_job(): void
    {
        \Illuminate\Support\Facades\Queue::fake();

        $team = Team::create([
            'category_id' => $this->category->id,
            'name' => 'Test WA Team',
            'payment_status' => 'pending',
            'payment_amount' => 500000,
        ]);

        TeamPlayer::create([
            'team_id' => $team->id,
            'player_order' => 1,
            'name' => 'Captain WA',
            'phone' => '081299887711',
        ]);

        $response = $this->actingAs($this->organizer)
            ->post(route('organizer.tournaments.registrations.status', [$this->tournament->id, $team->id]), [
                'status' => 'verified',
            ]);

        $response->assertRedirect();
        \Illuminate\Support\Facades\Queue::assertPushed(\App\Jobs\SendWhatsAppMessageJob::class, function ($job) {
            return $job->phone === '081299887711';
        });
    }
}

