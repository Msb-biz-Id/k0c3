<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\Court;
use App\Models\MasterDivision;
use App\Models\MasterSkillLevel;
use App\Models\MasterTier;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Mews\Purifier\Facades\Purifier;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SecurityAuditTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'superadmin']);
        Role::firstOrCreate(['name' => 'organizer']);
        Role::firstOrCreate(['name' => 'player']);
    }

    /**
     * 1. Test that all web responses contain HTTP Security Hardening Headers.
     */
    public function test_responses_contain_security_hardening_headers(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    /**
     * 2. Test XSS sanitization on rich text inputs (Purifier).
     */
    public function test_xss_scripts_are_stripped_from_rich_text_content(): void
    {
        $maliciousPayload = '<p>Normal text</p><script>alert("XSS")</script><img src="x" onerror="alert(1)" /><b>Bold safe</b>';
        
        $clean = Purifier::clean($maliciousPayload);

        $this->assertStringNotContainsString('<script>', $clean);
        $this->assertStringNotContainsString('alert("XSS")', $clean);
        $this->assertStringNotContainsString('onerror', $clean);
        $this->assertStringContainsString('Normal text', $clean);
        $this->assertStringContainsString('Bold safe', $clean);
    }

    /**
     * 3. Test IDOR protection: EO B cannot view, edit or delete EO A's tournament.
     */
    public function test_idor_eo_cannot_access_or_modify_other_eo_tournament(): void
    {
        $eoA = User::factory()->create();
        $eoA->assignRole('organizer');

        $eoB = User::factory()->create();
        $eoB->assignRole('organizer');

        $tournamentA = Tournament::create([
            'user_id' => $eoA->id,
            'name' => 'Turnamen EO A',
            'slug' => 'turnamen-eo-a',
            'sport_type' => 'padel',
            'start_date' => now()->addDays(7)->toDateString(),
            'end_date' => now()->addDays(9)->toDateString(),
            'venue_name' => 'Padel Club A',
            'bank_name' => 'BCA',
            'bank_account_number' => '12345678',
            'bank_account_holder' => 'EO A',
            'status' => 'draft',
        ]);

        $categoryA = TournamentCategory::create([
            'tournament_id' => $tournamentA->id,
            'name' => 'Open Men',
            'max_teams' => 8,
            'registration_fee' => 200000,
            'format' => 'groups_and_knockout',
        ]);

        // EO B tries to view EO A's tournament control desk
        $response = $this->actingAs($eoB)->get("/organizer/tournaments/{$tournamentA->id}");
        $response->assertStatus(404);

        // EO B tries to access Category Engine Configure
        $response = $this->actingAs($eoB)->get("/organizer/tournaments/{$tournamentA->id}/categories/{$categoryA->id}/configure");
        $response->assertStatus(403);

        // EO B tries to access Court Control
        $response = $this->actingAs($eoB)->get("/organizer/tournaments/{$tournamentA->id}/court-control");
        $response->assertStatus(403);

        // EO B tries to access Check-In desk
        $response = $this->actingAs($eoB)->get("/organizer/tournaments/{$tournamentA->id}/check-in");
        $response->assertStatus(403);

        // EO B tries to publish EO A's tournament
        $response = $this->actingAs($eoB)->patch("/organizer/tournaments/{$tournamentA->id}/publish");
        $response->assertStatus(404);

        // EO B tries to delete EO A's tournament
        $response = $this->actingAs($eoB)->delete("/organizer/tournaments/{$tournamentA->id}");
        $response->assertStatus(404);
    }

    /**
     * 4. Test IDOR protection on Match Sheet PDF generation.
     */
    public function test_idor_eo_cannot_download_match_sheet_of_other_tournament(): void
    {
        $eoA = User::factory()->create();
        $eoA->assignRole('organizer');

        $eoB = User::factory()->create();
        $eoB->assignRole('organizer');

        $tournamentA = Tournament::create([
            'user_id' => $eoA->id,
            'name' => 'Turnamen EO A',
            'slug' => 'turnamen-eo-a-match',
            'sport_type' => 'padel',
            'start_date' => now()->addDays(7)->toDateString(),
            'end_date' => now()->addDays(9)->toDateString(),
            'venue_name' => 'Padel Club A',
            'bank_name' => 'BCA',
            'bank_account_number' => '12345678',
            'bank_account_holder' => 'EO A',
            'status' => 'published',
        ]);

        $category = TournamentCategory::create([
            'tournament_id' => $tournamentA->id,
            'name' => 'Open Men',
            'max_teams' => 8,
            'registration_fee' => 200000,
            'format' => 'groups_and_knockout',
        ]);

        $team1 = Team::create(['category_id' => $category->id, 'name' => 'Tim 1']);
        $team2 = Team::create(['category_id' => $category->id, 'name' => 'Tim 2']);

        $match = TournamentMatch::create([
            'category_id' => $category->id,
            'team1_id' => $team1->id,
            'team2_id' => $team2->id,
            'match_number' => 'M01',
            'stage' => 'group',
            'round_order' => 1,
            'status' => 'pending',
        ]);

        // EO B attempts to download match sheet PDF
        $response = $this->actingAs($eoB)->get("/organizer/tournaments/{$tournamentA->id}/matches/{$match->id}/pdf");
        $response->assertStatus(403);
    }

    /**
     * 5. Test Superadmin can access any tournament regardless of owner.
     */
    public function test_superadmin_can_access_any_tournament(): void
    {
        $superadmin = User::factory()->create();
        $superadmin->assignRole('superadmin');

        $eo = User::factory()->create();
        $eo->assignRole('organizer');

        $tournament = Tournament::create([
            'user_id' => $eo->id,
            'name' => 'Turnamen Milik EO',
            'slug' => 'turnamen-milik-eo',
            'sport_type' => 'padel',
            'start_date' => now()->addDays(7)->toDateString(),
            'end_date' => now()->addDays(9)->toDateString(),
            'venue_name' => 'Padel Club',
            'bank_name' => 'BCA',
            'bank_account_number' => '12345678',
            'bank_account_holder' => 'EO',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($superadmin)->get("/organizer/tournaments/{$tournament->id}");
        $response->assertStatus(200);
    }

    /**
     * 6. Test SQL injection resistance in search queries.
     */
    public function test_sql_injection_payloads_do_not_cause_sql_errors(): void
    {
        $payloads = [
            "' OR '1'='1",
            "1; DROP TABLE tournaments; --",
            "' UNION SELECT * FROM users --",
            "<script>alert(1)</script>",
        ];

        foreach ($payloads as $payload) {
            $response = $this->get('/?search=' . urlencode($payload));
            $response->assertStatus(200);

            $response = $this->get('/api/regions/cities/' . urlencode($payload));
            $this->assertContains($response->status(), [200, 404]);
        }
    }
}
