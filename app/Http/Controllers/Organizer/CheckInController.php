<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\TournamentCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CheckInController extends Controller
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
     * Display Check-in & Registration Desk.
     */
    public function index(string $tournamentId): Response
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $categories = TournamentCategory::where('tournament_id', $tournament->id)
            ->with([
                'teams.players',
                'tier',
                'division',
                'skillLevel',
            ])
            ->get();

        return Inertia::render('Organizer/CheckIn/Index', [
            'tournament' => $tournament,
            'categories' => $categories,
        ]);
    }

    /**
     * Toggle player check-in status at tournament desk.
     */
    public function toggleCheckIn(string $tournamentId, string $teamId): RedirectResponse
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $team = Team::whereHas('category', function ($q) use ($tournament) {
            $q->where('tournament_id', $tournament->id);
        })->findOrFail($teamId);

        $isCheckedIn = !$team->is_checked_in;
        $team->update([
            'is_checked_in' => $isCheckedIn,
            'checked_in_at' => $isCheckedIn ? now() : null,
        ]);

        $statusText = $isCheckedIn ? 'Hadir & Terverifikasi' : 'Batal Check-in';
        return back()->with('success', "Status check-in {$team->name} diubah menjadi: {$statusText}.");
    }

    /**
     * Verify or reject team registration payment.
     */
    public function verifyPayment(Request $request, string $tournamentId, string $teamId): RedirectResponse
    {
        $tournament = Tournament::findOrFail($tournamentId);
        $this->authorizeTournament($tournament);

        $validated = $request->validate([
            'payment_status' => ['required', 'in:verified,rejected,pending'],
        ]);

        $team = Team::whereHas('category', function ($q) use ($tournament) {
            $q->where('tournament_id', $tournament->id);
        })->findOrFail($teamId);

        $team->update([
            'payment_status' => $validated['payment_status'],
            'payment_verified_at' => $validated['payment_status'] === 'verified' ? now() : null,
        ]);

        return back()->with('success', "Status pembayaran tim {$team->name} diperbarui menjadi {$validated['payment_status']}.");
    }
}
