<?php

namespace App\Services;

use App\Models\TournamentCategory;
use App\Models\Team;
use App\Models\TournamentMatch;
use Illuminate\Support\Collection;

class StandingsCalculatorService
{
    /**
     * Calculate standings for all groups in a category with strict 6-level tie-breaker.
     *
     * @param TournamentCategory $category
     * @return array<string, Collection> Keyed by group letter (e.g. 'A' => Collection, 'B' => Collection)
     */
    public function calculateForCategory(TournamentCategory $category): array
    {
        $teams = Team::where('category_id', $category->id)
            ->whereNotNull('group_letter')
            ->get();

        $matches = TournamentMatch::where('category_id', $category->id)
            ->where('stage', 'group')
            ->where('status', 'completed')
            ->get();

        $groupedTeams = $teams->groupBy('group_letter');
        $standings = [];

        foreach ($groupedTeams as $groupLetter => $groupTeams) {
            $groupMatches = $matches->where('group_letter', $groupLetter);
            $standings[$groupLetter] = $this->calculateSingleGroup($groupTeams, $groupMatches);
        }

        return $standings;
    }

    /**
     * Calculate standings for a single group of teams.
     */
    public function calculateSingleGroup(Collection $teams, Collection $matches): Collection
    {
        $table = $teams->map(function (Team $team) use ($matches) {
            $teamMatches = $matches->filter(function (TournamentMatch $m) use ($team) {
                return $m->team1_id === $team->id || $m->team2_id === $team->id;
            });

            $played = $teamMatches->count();
            $won = 0;
            $lost = 0;
            $gamesWon = 0;
            $gamesLost = 0;

            foreach ($teamMatches as $m) {
                $isTeam1 = $m->team1_id === $team->id;
                $teamScore = $isTeam1 ? $m->team1_set1_score : $m->team2_set1_score;
                $oppScore = $isTeam1 ? $m->team2_set1_score : $m->team1_set1_score;

                // Hitung games dari set 1, 2, 3
                $gamesWon += $teamScore + ($isTeam1 ? $m->team1_set2_score : $m->team2_set2_score) + ($isTeam1 ? $m->team1_set3_score : $m->team2_set3_score);
                $gamesLost += $oppScore + ($isTeam1 ? $m->team2_set2_score : $m->team1_set2_score) + ($isTeam1 ? $m->team2_set3_score : $m->team1_set3_score);

                if ($m->winner_team_id === $team->id) {
                    $won++;
                } else {
                    $lost++;
                }
            }

            $points = $won * 2; // Menang = 2, Kalah = 0
            $gameDifference = $gamesWon - $gamesLost;

            return [
                'team_id' => $team->id,
                'team_name' => $team->name,
                'played' => $played,
                'won' => $won,
                'lost' => $lost,
                'points' => $points,
                'games_won' => $gamesWon,
                'games_lost' => $gamesLost,
                'game_diff' => $gameDifference,
            ];
        });

        // 6-Level Tie-Breaker Sort
        return $table->sort(function ($a, $b) use ($matches) {
            // Level 1: Points
            if ($a['points'] !== $b['points']) {
                return $b['points'] <=> $a['points'];
            }

            // Level 2: Head-to-Head
            $h2hMatch = $matches->first(function (TournamentMatch $m) use ($a, $b) {
                return ($m->team1_id === $a['team_id'] && $m->team2_id === $b['team_id']) ||
                       ($m->team1_id === $b['team_id'] && $m->team2_id === $a['team_id']);
            });

            if ($h2hMatch && $h2hMatch->winner_team_id) {
                if ($h2hMatch->winner_team_id === $a['team_id']) return -1;
                if ($h2hMatch->winner_team_id === $b['team_id']) return 1;
            }

            // Level 3: Game Difference
            if ($a['game_diff'] !== $b['game_diff']) {
                return $b['game_diff'] <=> $a['game_diff'];
            }

            // Level 4: Total Games Won
            if ($a['games_won'] !== $b['games_won']) {
                return $b['games_won'] <=> $a['games_won'];
            }

            // Level 5: Fewest Games Lost
            if ($a['games_lost'] !== $b['games_lost']) {
                return $a['games_lost'] <=> $b['games_lost'];
            }

            // Level 6: Team Name Alphabetical fallback
            return strcmp($a['team_name'], $b['team_name']);
        })->values();
    }
}
