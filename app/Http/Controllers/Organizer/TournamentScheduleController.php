<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Court;
use App\Models\Tournament;
use App\Models\TournamentMatch;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TournamentScheduleController extends Controller
{
    /**
     * Authorize that the current user owns this tournament or is a superadmin.
     */
    protected function authorizeTournament(string $tournamentId): Tournament
    {
        /** @var User $user */
        $user = Auth::user();
        $tournament = Tournament::with(['categories', 'courts'])->findOrFail($tournamentId);

        if ($tournament->user_id !== $user->id && !$user->hasRole('superadmin')) {
            abort(403, 'Anda tidak berhak mengakses jadwal turnamen ini.');
        }

        return $tournament;
    }

    public function index(string $tournamentId): Response
    {
        $tournament = $this->authorizeTournament($tournamentId);

        $allMatches = TournamentMatch::whereIn('category_id', $tournament->categories->pluck('id'))
            ->with(['team1', 'team2', 'category', 'court'])
            ->orderBy('scheduled_time')
            ->orderBy('round_order')
            ->orderBy('match_number')
            ->get();

        $scheduledMatches = $allMatches->filter(fn ($m) => $m->scheduled_time && $m->court_id)->values();
        $unassignedMatches = $allMatches->filter(fn ($m) => !$m->scheduled_time || !$m->court_id)->values();

        return Inertia::render('Organizer/Tournaments/Schedule', [
            'tournament' => $tournament,
            'courts' => $tournament->courts,
            'categories' => $tournament->categories,
            'scheduledMatches' => $scheduledMatches,
            'unassignedMatches' => $unassignedMatches,
        ]);
    }

    public function assign(Request $request, string $tournamentId): RedirectResponse
    {
        $this->authorizeTournament($tournamentId);

        $validated = $request->validate([
            'match_id' => 'required|exists:matches,id',
            'court_id' => 'required|exists:courts,id',
            'scheduled_time' => 'required|string',
        ]);

        $match = TournamentMatch::findOrFail($validated['match_id']);
        $match->update([
            'court_id' => $validated['court_id'],
            'scheduled_time' => Carbon::parse($validated['scheduled_time']),
        ]);

        return back()->with('success', 'Pertandingan berhasil dijadwalkan!');
    }

    public function unassign(Request $request, string $tournamentId): RedirectResponse
    {
        $this->authorizeTournament($tournamentId);

        $validated = $request->validate([
            'match_id' => 'required|exists:matches,id',
        ]);

        $match = TournamentMatch::findOrFail($validated['match_id']);
        $match->update([
            'court_id' => null,
            'scheduled_time' => null,
        ]);

        return back()->with('success', 'Pertandingan dikeluarkan dari jadwal!');
    }

    public function autoSchedule(Request $request, string $tournamentId): RedirectResponse
    {
        $tournament = $this->authorizeTournament($tournamentId);

        $validated = $request->validate([
            'start_date' => 'required|date',
            'start_time' => 'required|string',
            'interval_minutes' => 'required|integer|min:20|max:120',
            'court_ids' => 'required|array|min:1',
            'court_ids.*' => 'exists:courts,id',
        ]);

        $courts = Court::whereIn('id', $validated['court_ids'])->get();
        if ($courts->isEmpty()) {
            return back()->with('error', 'Pilih minimal satu lapangan yang aktif.');
        }

        $matches = TournamentMatch::whereIn('category_id', $tournament->categories->pluck('id'))
            ->where(function ($query) {
                $query->whereNull('scheduled_time')
                    ->orWhereNull('court_id');
            })
            ->where('status', '!=', 'completed')
            ->orderBy('round_order')
            ->orderBy('match_number')
            ->get();

        if ($matches->isEmpty()) {
            return back()->with('info', 'Tidak ada pertandingan yang perlu dijadwalkan.');
        }

        $currentSlot = Carbon::parse($validated['start_date'] . ' ' . $validated['start_time']);
        $courtIndex = 0;
        $count = 0;

        foreach ($matches as $match) {
            $assignedCourt = $courts[$courtIndex];

            $match->update([
                'court_id' => $assignedCourt->id,
                'scheduled_time' => $currentSlot->copy(),
            ]);

            $count++;
            $courtIndex++;

            if ($courtIndex >= count($courts)) {
                $courtIndex = 0;
                $currentSlot->addMinutes($validated['interval_minutes']);
            }
        }

        return back()->with('success', "{$count} pertandingan berhasil dijadwalkan secara otomatis!");
    }

    public function resetSchedule(Request $request, string $tournamentId): RedirectResponse
    {
        $tournament = $this->authorizeTournament($tournamentId);

        TournamentMatch::whereIn('category_id', $tournament->categories->pluck('id'))
            ->where('status', '!=', 'completed')
            ->update([
                'court_id' => null,
                'scheduled_time' => null,
            ]);

        return back()->with('success', 'Seluruh jadwal pertandingan turnamen berhasil di-reset.');
    }
}
