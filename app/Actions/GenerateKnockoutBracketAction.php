<?php

namespace App\Actions;

use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Services\StandingsCalculatorService;
use Illuminate\Support\Facades\DB;

class GenerateKnockoutBracketAction
{
    public function __construct(
        protected StandingsCalculatorService $standingsCalculator
    ) {}

    /**
     * Generate knockout bracket nodes with binary tree pointers (next_match_id).
     *
     * @param TournamentCategory $category
     * @return int Total bracket matches created
     */
    public function execute(TournamentCategory $category): int
    {
        return DB::transaction(function () use ($category) {
            // Hapus bracket lama yang masih pending
            TournamentMatch::where('category_id', $category->id)
                ->where('stage', 'knockout')
                ->delete();

            // Hitung klasemen grup
            $standings = $this->standingsCalculator->calculateForCategory($category);
            $advancingPerGroup = $category->advancing_per_group ?: 2;

            $qualifiedTeams = []; // e.g. ['A1' => team_id, 'A2' => team_id, 'B1' => ..., 'B2' => ...]
            foreach ($standings as $groupLetter => $teamsTable) {
                $topTeams = $teamsTable->take($advancingPerGroup)->values();
                foreach ($topTeams as $pos => $teamData) {
                    $slotKey = $groupLetter . ($pos + 1); // e.g. A1, A2
                    $qualifiedTeams[$slotKey] = $teamData['team_id'];
                }
            }

            $totalQualified = count($qualifiedTeams);

            // Skenario 1: 4 Tim Lolos (Semi Final -> Final & Juara 3)
            if ($totalQualified >= 4 && count($standings) >= 2) {
                // 1. Buat Match FINAL
                $final = TournamentMatch::create([
                    'category_id' => $category->id,
                    'stage' => 'knockout',
                    'round_name' => 'Final',
                    'round_order' => 3,
                    'match_number' => 4,
                    'status' => 'pending',
                ]);

                // 2. Buat Match Perebutan Juara 3 (jika diaktifkan)
                $bronzeMatch = null;
                if ($category->has_third_place) {
                    $bronzeMatch = TournamentMatch::create([
                        'category_id' => $category->id,
                        'stage' => 'knockout',
                        'round_name' => 'Perebutan Juara 3',
                        'round_order' => 3,
                        'match_number' => 3,
                        'status' => 'pending',
                    ]);
                }

                // 3. Buat Semi Final 1: Juara A vs Runner-up B (A1 vs B2)
                $sf1 = TournamentMatch::create([
                    'category_id' => $category->id,
                    'stage' => 'knockout',
                    'round_name' => 'Semi Final',
                    'round_order' => 2,
                    'match_number' => 1,
                    'team1_id' => $qualifiedTeams['A1'] ?? null,
                    'team2_id' => $qualifiedTeams['B2'] ?? null,
                    'next_match_id' => $final->id,
                    'loser_next_match_id' => $bronzeMatch?->id,
                    'status' => 'pending',
                ]);

                // 4. Buat Semi Final 2: Juara B vs Runner-up A (B1 vs A2)
                $sf2 = TournamentMatch::create([
                    'category_id' => $category->id,
                    'stage' => 'knockout',
                    'round_name' => 'Semi Final',
                    'round_order' => 2,
                    'match_number' => 2,
                    'team1_id' => $qualifiedTeams['B1'] ?? null,
                    'team2_id' => $qualifiedTeams['A2'] ?? null,
                    'next_match_id' => $final->id,
                    'loser_next_match_id' => $bronzeMatch?->id,
                    'status' => 'pending',
                ]);

                return $bronzeMatch ? 4 : 3;
            }

            // Skenario 2: 2 Tim Lolos (Langsung Final)
            $final = TournamentMatch::create([
                'category_id' => $category->id,
                'stage' => 'knockout',
                'round_name' => 'Final',
                'round_order' => 1,
                'match_number' => 1,
                'team1_id' => $qualifiedTeams['A1'] ?? array_values($qualifiedTeams)[0] ?? null,
                'team2_id' => $qualifiedTeams['B1'] ?? array_values($qualifiedTeams)[1] ?? null,
                'status' => 'pending',
            ]);

            return 1;
        });
    }
}
