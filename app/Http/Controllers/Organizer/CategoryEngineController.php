<?php

namespace App\Http\Controllers\Organizer;

use App\Actions\DrawTeamsIntoGroupsAction;
use App\Actions\GenerateKnockoutBracketAction;
use App\Actions\GenerateRoundRobinFixturesAction;
use App\Http\Controllers\Controller;
use App\Models\Court;
use App\Models\Team;
use App\Models\TeamPlayer;
use App\Models\Tournament;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Services\StandingsCalculatorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CategoryEngineController extends Controller
{
    /**
     * Authorize that the current user owns this tournament or is a superadmin.
     */
    protected function authorizeTournament(Tournament $tournament): void
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasRole('superadmin') && $tournament->user_id !== $user->id) {
            abort(403, 'Akses turnamen ditolak.');
        }
    }

    // ==========================================
    // 1. SUB-TAB KONFIGURASI ATURAN BABAK
    // ==========================================

    public function configure(string $tournamentId, string $categoryId): Response
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $category = TournamentCategory::where('tournament_id', $tournament->id)
            ->with(['tier', 'division', 'skillLevel'])
            ->findOrFail($categoryId);

        return Inertia::render('Organizer/Categories/Configure', [
            'tournament' => $tournament,
            'category' => $category,
        ]);
    }

    public function updateConfigure(Request $request, string $tournamentId, string $categoryId): RedirectResponse
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $category = TournamentCategory::where('tournament_id', $tournament->id)->findOrFail($categoryId);

        $validated = $request->validate([
            'max_teams' => ['required', 'integer', 'min:2', 'max:64'],
            'registration_fee' => ['required', 'numeric', 'min:0'],
            'format' => ['required', 'string', 'in:group_knockout,knockout_only,round_robin'],
            'group_count' => ['required', 'integer', 'min:1', 'max:8'],
            'advancing_per_group' => ['required', 'integer', 'min:1', 'max:4'],
            'has_wildcard' => ['nullable', 'boolean'],
            'has_third_place' => ['nullable', 'boolean'],
            'knockout_method' => ['required', 'string', 'in:cross_group,seeded_draw'],
            'match_rules' => ['nullable', 'array'],
        ]);

        $category->update($validated);

        return back()->with('success', 'Konfigurasi aturan babak kategori berhasil disimpan.');
    }

    // ==========================================
    // 2. SUB-TAB TIM & UNDIAN GRUP
    // ==========================================

    public function teams(string $tournamentId, string $categoryId): Response
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $category = TournamentCategory::where('tournament_id', $tournament->id)
            ->with(['teams.players', 'tier', 'division', 'skillLevel'])
            ->findOrFail($categoryId);

        return Inertia::render('Organizer/Categories/Teams', [
            'tournament' => $tournament,
            'category' => $category,
            'teams' => $category->teams,
        ]);
    }

    public function storeManualTeam(Request $request, string $tournamentId, string $categoryId): RedirectResponse
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $category = TournamentCategory::where('tournament_id', $tournament->id)->findOrFail($categoryId);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'player1_name' => ['required', 'string', 'max:100'],
            'player1_phone' => ['nullable', 'string', 'max:30'],
            'player2_name' => ['required', 'string', 'max:100'],
            'player2_phone' => ['nullable', 'string', 'max:30'],
            'group_draw_seed' => ['nullable', 'integer', 'min:1', 'max:8'],
        ]);

        DB::transaction(function () use ($category, $validated) {
            $team = Team::create([
                'category_id' => $category->id,
                'name' => $validated['name'],
                'group_draw_seed' => $validated['group_draw_seed'] ?? null,
                'payment_status' => 'verified', // Manual add oleh EO langsung verified
                'payment_verified_at' => now(),
            ]);

            // Player 1 (Kapten)
            TeamPlayer::create([
                'team_id' => $team->id,
                'player_order' => 1,
                'name' => $validated['player1_name'],
                'phone' => $validated['player1_phone'] ?? null,
            ]);

            // Player 2 (Partner)
            TeamPlayer::create([
                'team_id' => $team->id,
                'player_order' => 2,
                'name' => $validated['player2_name'],
                'phone' => $validated['player2_phone'] ?? null,
            ]);
        });

        return back()->with('success', 'Tim baru berhasil didaftarkan ke kategori ini.');
    }

    public function drawGroups(Request $request, string $tournamentId, string $categoryId, DrawTeamsIntoGroupsAction $action): RedirectResponse
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $category = TournamentCategory::where('tournament_id', $tournament->id)->findOrFail($categoryId);

        $groupCount = $request->input('group_count') ? (int) $request->input('group_count') : null;

        $groups = $action->execute($category, $groupCount);

        return back()->with('success', 'Undian grup seimbang berhasil dijalankan untuk Grup ' . implode(', ', $groups) . '.');
    }

    // ==========================================
    // 3. SUB-TAB JADWAL MATCHES & FIXTURES
    // ==========================================

    public function matches(string $tournamentId, string $categoryId): Response
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $category = TournamentCategory::where('tournament_id', $tournament->id)
            ->with(['tier', 'division', 'skillLevel'])
            ->findOrFail($categoryId);

        $matches = TournamentMatch::where('category_id', $category->id)
            ->with(['team1', 'team2', 'court', 'winnerTeam'])
            ->orderBy('stage', 'asc')
            ->orderBy('round_order', 'asc')
            ->orderBy('match_number', 'asc')
            ->get();

        $courts = Court::where('tournament_id', $tournament->id)->get();

        return Inertia::render('Organizer/Categories/Matches', [
            'tournament' => $tournament,
            'category' => $category,
            'matches' => $matches,
            'courts' => $courts,
        ]);
    }

    public function generateFixtures(string $tournamentId, string $categoryId, GenerateRoundRobinFixturesAction $action): RedirectResponse
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $category = TournamentCategory::where('tournament_id', $tournament->id)->findOrFail($categoryId);

        $count = $action->execute($category);

        return back()->with('success', "Berhasil menjadwalkan {$count} pertandingan babak grup secara otomatis.");
    }

    // ==========================================
    // 4. SUB-TAB KLASEMEN GRUP (6-LEVEL TIE BREAKER)
    // ==========================================

    public function groups(string $tournamentId, string $categoryId, StandingsCalculatorService $calculator): Response
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $category = TournamentCategory::where('tournament_id', $tournament->id)
            ->with(['tier', 'division', 'skillLevel'])
            ->findOrFail($categoryId);

        $standings = $calculator->calculateForCategory($category);

        return Inertia::render('Organizer/Categories/Groups', [
            'tournament' => $tournament,
            'category' => $category,
            'standings' => $standings,
        ]);
    }

    // ==========================================
    // 5. SUB-TAB BRACKET BAGAN GUGUR
    // ==========================================

    public function bracket(string $tournamentId, string $categoryId): Response
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $category = TournamentCategory::where('tournament_id', $tournament->id)
            ->with(['tier', 'division', 'skillLevel'])
            ->findOrFail($categoryId);

        $bracketMatches = TournamentMatch::where('category_id', $category->id)
            ->where('stage', 'knockout')
            ->with(['team1', 'team2', 'winnerTeam', 'court'])
            ->orderBy('round_order', 'asc')
            ->orderBy('match_number', 'asc')
            ->get();

        return Inertia::render('Organizer/Categories/Bracket', [
            'tournament' => $tournament,
            'category' => $category,
            'bracketMatches' => $bracketMatches,
        ]);
    }

    public function generateBracket(string $tournamentId, string $categoryId, GenerateKnockoutBracketAction $action): RedirectResponse
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $category = TournamentCategory::where('tournament_id', $tournament->id)->findOrFail($categoryId);

        $count = $action->execute($category);

        return back()->with('success', "Bagan sistem gugur ({$count} match) berhasil dibuat otomatis dari klasemen grup.");
    }

    // ==========================================
    // 6. SUB-TAB RULEBOOK & REGULASI PERTANDINGAN
    // ==========================================

    public function rules(string $tournamentId, string $categoryId): Response
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $category = TournamentCategory::where('tournament_id', $tournament->id)
            ->with(['tier', 'division', 'skillLevel'])
            ->findOrFail($categoryId);

        return Inertia::render('Organizer/Categories/Rules', [
            'tournament' => $tournament,
            'category' => $category,
        ]);
    }

    public function updateRules(Request $request, string $tournamentId, string $categoryId): RedirectResponse
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $category = TournamentCategory::where('tournament_id', $tournament->id)->findOrFail($categoryId);

        $validated = $request->validate([
            'preset' => 'required|string',
            'rulebook_text' => 'nullable|string',
            'rulebook_pdf_url' => 'nullable|string',
            'warmup_duration_minutes' => 'nullable|integer',
            'walkover_grace_minutes' => 'nullable|integer',
            'super_tiebreak_points' => 'nullable|integer',
            'golden_point_enabled' => 'nullable|boolean',
        ]);

        $currentRules = $category->match_rules ?? [];
        $category->update([
            'match_rules' => array_merge($currentRules, $validated),
        ]);

        return back()->with('success', 'Regulasi pertandingan kategori berhasil diperbarui!');
    }
}
