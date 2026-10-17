<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Court;
use App\Models\Tournament;
use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\ScoreLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CourtControlController extends Controller
{
    private function authorizeTournament(Tournament $tournament): void
    {
        if (Auth::user()->hasRole('superadmin')) {
            return;
        }

        if ($tournament->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this tournament.');
        }
    }

    /**
     * Court Control Dashboard with high-contrast monitors & match queue.
     */
    public function index(string $tournamentId): Response
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $courts = Court::where('tournament_id', $tournament->id)
            ->with([
                'matches' => function ($query) {
                    $query->whereIn('status', ['in_progress', 'pending'])
                        ->with(['team1', 'team2', 'category'])
                        ->orderBy('round_order')
                        ->orderBy('match_number');
                }
            ])
            ->get();

        $categoryIds = TournamentCategory::where('tournament_id', $tournament->id)->pluck('id');

        // Antrean match yang belum punya lapangan atau status pending
        $unassignedMatches = TournamentMatch::whereIn('category_id', $categoryIds)
            ->whereNull('court_id')
            ->where('status', 'pending')
            ->whereNotNull('team1_id')
            ->whereNotNull('team2_id')
            ->with(['team1', 'team2', 'category'])
            ->orderBy('stage', 'asc')
            ->orderBy('round_order', 'asc')
            ->orderBy('match_number', 'asc')
            ->get();

        return Inertia::render('Organizer/CourtControl/Index', [
            'tournament' => $tournament,
            'courts' => $courts,
            'unassignedMatches' => $unassignedMatches,
        ]);
    }

    /**
     * Assign match to a specific court.
     */
    public function assignMatch(Request $request, string $tournamentId): RedirectResponse
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $validated = $request->validate([
            'match_id' => ['required', 'exists:matches,id'],
            'court_id' => ['required', 'exists:courts,id'],
        ]);

        $match = TournamentMatch::findOrFail($validated['match_id']);
        $match->update([
            'court_id' => $validated['court_id'],
        ]);

        return back()->with('success', "Pertandingan berhasil ditugaskan ke Lapangan.");
    }

    /**
     * Change match status (in_progress, completed, pending) and advance winners in knockout.
     */
    public function updateStatus(Request $request, string $tournamentId, string $matchId): RedirectResponse
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $validated = $request->validate([
            'status' => ['required', 'in:pending,in_progress,completed'],
            'winner_team_id' => ['nullable', 'exists:teams,id'],
            'team1_set1_score' => ['nullable', 'integer', 'min:0', 'max:20'],
            'team2_set1_score' => ['nullable', 'integer', 'min:0', 'max:20'],
        ]);

        DB::transaction(function () use ($matchId, $validated) {
            $match = TournamentMatch::where('id', $matchId)->lockForUpdate()->firstOrFail();

            $oldStatus = $match->status;
            $updates = ['status' => $validated['status']];

            if ($validated['status'] === 'in_progress' && !$match->started_at) {
                $updates['started_at'] = now();
            }

            if ($validated['status'] === 'completed') {
                $updates['completed_at'] = now();
                if (isset($validated['winner_team_id'])) {
                    $updates['winner_team_id'] = $validated['winner_team_id'];
                }
                if (isset($validated['team1_set1_score'])) {
                    $updates['team1_set1_score'] = $validated['team1_set1_score'];
                }
                if (isset($validated['team2_set1_score'])) {
                    $updates['team2_set1_score'] = $validated['team2_set1_score'];
                }

                // Advance winner to next match in Knockout stage
                if ($match->next_match_id && !empty($updates['winner_team_id'])) {
                    $nextMatch = TournamentMatch::find($match->next_match_id);
                    if ($nextMatch) {
                        if (empty($nextMatch->team1_id)) {
                            $nextMatch->update(['team1_id' => $updates['winner_team_id']]);
                        } elseif (empty($nextMatch->team2_id) && $nextMatch->team1_id !== $updates['winner_team_id']) {
                            $nextMatch->update(['team2_id' => $updates['winner_team_id']]);
                        }
                    }
                }

                // Advance loser to 3rd place match if exists
                if ($match->loser_next_match_id && !empty($updates['winner_team_id'])) {
                    $loserId = ($updates['winner_team_id'] === $match->team1_id) ? $match->team2_id : $match->team1_id;
                    $bronzeMatch = TournamentMatch::find($match->loser_next_match_id);
                    if ($bronzeMatch && $loserId) {
                        if (empty($bronzeMatch->team1_id)) {
                            $bronzeMatch->update(['team1_id' => $loserId]);
                        } elseif (empty($bronzeMatch->team2_id) && $bronzeMatch->team1_id !== $loserId) {
                            $bronzeMatch->update(['team2_id' => $loserId]);
                        }
                    }
                }
            }

            $match->update($updates);

            // Audit Log
            ScoreLog::create([
                'match_id' => $match->id,
                'user_id' => Auth::id(),
                'court_name' => $match->court?->name,
                'previous_score' => "Status: {$oldStatus}",
                'new_score' => "Status: {$validated['status']}",
                'action_type' => 'status_change',
                'created_at' => now(),
            ]);
        });

        return back()->with('success', 'Status pertandingan berhasil diperbarui.');
    }

    /**
     * Dispatch WhatsApp court call notification to both teams.
     */
    public function callPlayers(string $tournamentId, string $matchId): RedirectResponse
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $match = TournamentMatch::where('id', $matchId)
            ->with(['court', 'category', 'team1.teamPlayers', 'team2.teamPlayers'])
            ->firstOrFail();

        $courtName = $match->court?->name ?? 'Lapangan Pertandingan';
        $categoryName = $match->category->name ?? 'Kategori Turnamen';
        $roundName = $match->round_name;

        $sentCount = 0;
        foreach ([$match->team1, $match->team2] as $team) {
            if (!$team) continue;
            foreach ($team->teamPlayers as $player) {
                if (empty($player->phone)) continue;

                $message = "Halo {$player->name}!\n\nPertandingan tim *{$team->name}* di turnamen *{$tournament->name}*:\nKategori: {$categoryName}\nBabak: {$roundName}\n\nSilakan segera merapat ke *{$courtName}* sekarang (pemanasan dimulai dalam 5 menit).\n\nLive Skor: " . url("/tournaments/{$tournament->slug}");

                \App\Jobs\SendWhatsAppMessageJob::dispatch($player->phone, $message, 'court_call');
                $sentCount++;
            }
        }

        return back()->with('success', "Panggilan lapangan berhasil dikirim ke {$sentCount} pemain via WhatsApp!");
    }
}
