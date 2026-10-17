<?php

namespace App\Actions;

use App\Models\TournamentCategory;
use App\Models\Team;
use Illuminate\Support\Facades\DB;

class DrawTeamsIntoGroupsAction
{
    /**
     * Execute Fisher-Yates group draw with seeding isolation.
     *
     * @param TournamentCategory $category
     * @param int|null $groupCount Override group count or use category default
     * @return array Array of group letters generated
     */
    public function execute(TournamentCategory $category, ?int $groupCount = null): array
    {
        $numGroups = $groupCount ?: ($category->group_count ?: 2);
        $groupLetters = array_slice(range('A', 'Z'), 0, $numGroups);

        $teams = Team::where('category_id', $category->id)->get();

        if ($teams->count() < $numGroups) {
            throw new \InvalidArgumentException("Jumlah tim ({$teams->count()}) tidak mencukupi untuk {$numGroups} grup.");
        }

        // Pisahkan tim unggulan (seeded) dan non-unggulan
        $seededTeams = $teams->whereNotNull('group_draw_seed')->sortBy('group_draw_seed')->values();
        $unseededTeams = $teams->whereNull('group_draw_seed')->values()->all();

        // Fisher-Yates shuffle untuk tim non-unggulan
        $count = count($unseededTeams);
        for ($i = $count - 1; $i > 0; $i--) {
            $j = random_int(0, $i);
            $temp = $unseededTeams[$i];
            $unseededTeams[$i] = $unseededTeams[$j];
            $unseededTeams[$j] = $temp;
        }

        DB::transaction(function () use ($numGroups, $groupLetters, $seededTeams, $unseededTeams) {
            // 1. Tempatkan tim unggulan (Seeding Isolation)
            // Unggulan 1 -> Grup A, Unggulan 2 -> Grup B, dst.
            $groupAssignments = array_fill_keys($groupLetters, []);

            foreach ($seededTeams as $idx => $team) {
                $targetGroup = $groupLetters[$idx % $numGroups];
                $groupAssignments[$targetGroup][] = $team->id;
            }

            // 2. Distribusikan tim non-unggulan secara bergantian (Snake distribution)
            $currentGroupIdx = count($seededTeams) % $numGroups;
            foreach ($unseededTeams as $team) {
                $targetGroup = $groupLetters[$currentGroupIdx % $numGroups];
                $groupAssignments[$targetGroup][] = $team->id;
                $currentGroupIdx++;
            }

            // 3. Simpan perubahan ke database
            foreach ($groupAssignments as $groupLetter => $teamIds) {
                Team::whereIn('id', $teamIds)->update(['group_letter' => $groupLetter]);
            }
        });

        return $groupLetters;
    }
}
