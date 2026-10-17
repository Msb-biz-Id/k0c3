<?php

namespace App\Actions;

use App\Models\TournamentCategory;
use App\Models\TournamentMatch;
use App\Models\Team;
use Illuminate\Support\Facades\DB;

class GenerateRoundRobinFixturesAction
{
    /**
     * Generate round-robin match fixtures using Berger circle method.
     *
     * @param TournamentCategory $category
     * @return int Total matches created
     */
    public function execute(TournamentCategory $category): int
    {
        $teams = Team::where('category_id', $category->id)
            ->whereNotNull('group_letter')
            ->get();

        if ($teams->isEmpty()) {
            throw new \InvalidArgumentException('Belum ada tim yang diundi ke dalam grup.');
        }

        $groupedTeams = $teams->groupBy('group_letter');
        $totalMatchesCreated = 0;

        DB::transaction(function () use ($category, $groupedTeams, &$totalMatchesCreated) {
            // Hapus pertandingan grup lama yang belum berjalan
            TournamentMatch::where('category_id', $category->id)
                ->where('stage', 'group')
                ->where('status', 'pending')
                ->delete();

            $matchCounter = 1;

            foreach ($groupedTeams as $groupLetter => $groupTeams) {
                $teamList = $groupTeams->pluck('id')->all();
                $numTeams = count($teamList);

                if ($numTeams < 2) continue;

                // Jika jumlah tim ganjil, tambahkan slot BYE (null)
                $hasDummy = false;
                if ($numTeams % 2 !== 0) {
                    $teamList[] = null;
                    $numTeams++;
                    $hasDummy = true;
                }

                $totalRounds = $numTeams - 1;
                $matchesPerRound = $numTeams / 2;

                // Algoritma Berger (Circle Method)
                for ($round = 0; $round < $totalRounds; $round++) {
                    for ($match = 0; $match < $matchesPerRound; $match++) {
                        $team1Id = $teamList[$match];
                        $team2Id = $teamList[$numTeams - 1 - $match];

                        // Lewati pertandingan jika melawan dummy BYE
                        if ($team1Id === null || $team2Id === null) {
                            continue;
                        }

                        TournamentMatch::create([
                            'category_id' => $category->id,
                            'stage' => 'group',
                            'group_letter' => $groupLetter,
                            'round_name' => "Putaran " . ($round + 1),
                            'round_order' => $round + 1,
                            'match_number' => $matchCounter++,
                            'team1_id' => $team1Id,
                            'team2_id' => $team2Id,
                            'status' => 'pending',
                        ]);

                        $totalMatchesCreated++;
                    }

                    // Putar array tim (kecuali elemen pertama yang tetap fixed)
                    $fixed = $teamList[0];
                    $rotating = array_slice($teamList, 1);
                    $last = array_pop($rotating);
                    array_unshift($rotating, $last);
                    $teamList = array_merge([$fixed], $rotating);
                }
            }
        });

        return $totalMatchesCreated;
    }
}
