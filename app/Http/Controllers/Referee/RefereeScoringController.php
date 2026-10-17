<?php

namespace App\Http\Controllers\Referee;

use App\Http\Controllers\Controller;
use App\Models\Court;
use App\Models\TournamentMatch;
use App\Models\ScoreLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RefereeScoringController extends Controller
{
    /**
     * Show mobile thumb-friendly referee scoring web app.
     * No authentication needed, secured via unique Court Token.
     */
    public function show(string $token): Response
    {
        $court = Court::where('referee_token', $token)
            ->with(['tournament'])
            ->firstOrFail();

        $activeMatch = TournamentMatch::where('court_id', $court->id)
            ->where('status', 'in_progress')
            ->with(['team1', 'team2', 'category'])
            ->first();

        if (!$activeMatch) {
            // Jika tidak ada yang sedang jalan, ambil match pending berikutnya di lapangan ini
            $activeMatch = TournamentMatch::where('court_id', $court->id)
                ->where('status', 'pending')
                ->whereNotNull('team1_id')
                ->whereNotNull('team2_id')
                ->with(['team1', 'team2', 'category'])
                ->orderBy('round_order')
                ->orderBy('match_number')
                ->first();
        }

        $upcomingMatches = TournamentMatch::where('court_id', $court->id)
            ->where('status', 'pending')
            ->whereNotNull('team1_id')
            ->whereNotNull('team2_id')
            ->with(['team1', 'team2', 'category'])
            ->orderBy('round_order')
            ->orderBy('match_number')
            ->get();

        return Inertia::render('Referee/Scoring', [
            'court' => $court,
            'tournament' => $court->tournament,
            'activeMatch' => $activeMatch,
            'upcomingMatches' => $upcomingMatches,
        ]);
    }

    /**
     * Start match from referee terminal.
     */
    public function startMatch(string $token, string $matchId): RedirectResponse
    {
        $court = Court::where('referee_token', $token)->firstOrFail();

        DB::transaction(function () use ($court, $matchId) {
            $match = TournamentMatch::where('id', $matchId)
                ->where('court_id', $court->id)
                ->lockForUpdate()
                ->firstOrFail();

            $match->update([
                'status' => 'in_progress',
                'started_at' => now(),
            ]);

            ScoreLog::create([
                'match_id' => $match->id,
                'court_name' => $court->name,
                'previous_score' => 'Status: pending',
                'new_score' => 'Status: in_progress',
                'action_type' => 'match_started',
                'created_at' => now(),
            ]);
        });

        $startedMatch = TournamentMatch::with('category')->find($matchId);
        if ($startedMatch && $startedMatch->category) {
            \App\Events\MatchScoreUpdated::dispatch($startedMatch, $startedMatch->category->tournament_id);
        }

        return back()->with('success', 'Pertandingan dimulai!');
    }

    /**
     * Submit live point or set score with pessimistic locking.
     */
    public function updateScore(Request $request, string $token, string $matchId): RedirectResponse
    {
        $court = Court::where('referee_token', $token)->firstOrFail();

        $validated = $request->validate([
            'team1_set1_score' => ['required', 'integer', 'min:0', 'max:20'],
            'team2_set1_score' => ['required', 'integer', 'min:0', 'max:20'],
            'current_game_score' => ['nullable', 'string', 'max:50'],
            'server_team' => ['nullable', 'integer', 'in:1,2'],
            'is_finish' => ['nullable', 'boolean'],
            'winner_team_id' => ['nullable', 'exists:teams,id'],
        ]);

        DB::transaction(function () use ($court, $matchId, $validated) {
            $match = TournamentMatch::where('id', $matchId)
                ->where('court_id', $court->id)
                ->lockForUpdate()
                ->firstOrFail();

            $prevScoreDesc = "Set 1: {$match->team1_set1_score}-{$match->team2_set1_score} ({$match->current_game_score})";
            $newScoreDesc = "Set 1: {$validated['team1_set1_score']}-{$validated['team2_set1_score']} ({$validated['current_game_score']})";

            $updates = [
                'team1_set1_score' => $validated['team1_set1_score'],
                'team2_set1_score' => $validated['team2_set1_score'],
                'current_game_score' => $validated['current_game_score'] ?? null,
                'server_team' => $validated['server_team'] ?? $match->server_team,
            ];

            if (!empty($validated['is_finish']) && !empty($validated['winner_team_id'])) {
                $updates['status'] = 'completed';
                $updates['completed_at'] = now();
                $updates['winner_team_id'] = $validated['winner_team_id'];

                // Knockout Advancement
                if ($match->next_match_id) {
                    $nextMatch = TournamentMatch::find($match->next_match_id);
                    if ($nextMatch) {
                        if (empty($nextMatch->team1_id)) {
                            $nextMatch->update(['team1_id' => $validated['winner_team_id']]);
                        } elseif (empty($nextMatch->team2_id) && $nextMatch->team1_id !== $validated['winner_team_id']) {
                            $nextMatch->update(['team2_id' => $validated['winner_team_id']]);
                        }
                    }
                }

                // Bronze Match Advancement
                if ($match->loser_next_match_id) {
                    $loserId = ($validated['winner_team_id'] === $match->team1_id) ? $match->team2_id : $match->team1_id;
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

            // Audit Trail
            ScoreLog::create([
                'match_id' => $match->id,
                'court_name' => $court->name,
                'previous_score' => $prevScoreDesc,
                'new_score' => $newScoreDesc,
                'action_type' => !empty($validated['is_finish']) ? 'match_completed' : 'score_update',
                'created_at' => now(),
            ]);
        });

        $updatedMatch = TournamentMatch::with('category')->find($matchId);
        if ($updatedMatch && $updatedMatch->category) {
            \App\Events\MatchScoreUpdated::dispatch($updatedMatch, $updatedMatch->category->tournament_id);
        }

        return back()->with('success', 'Skor berhasil diperbarui.');
    }
}
