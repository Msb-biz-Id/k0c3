<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Court;
use App\Models\Tournament;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CourtManagementController extends Controller
{
    /**
     * Authorize that the current user owns this tournament or is a superadmin.
     */
    protected function authorizeTournament(string $tournamentId): Tournament
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $tournament = Tournament::findOrFail($tournamentId);

        if ($tournament->user_id !== $user->id && !$user->hasRole('superadmin')) {
            abort(403, 'Akses lapangan turnamen ditolak.');
        }

        return $tournament;
    }

    public function index(string $tournamentId): Response
    {
        $tournament = $this->authorizeTournament($tournamentId);

        $courts = Court::where('tournament_id', $tournament->id)
            ->withCount(['matches as active_matches_count' => function ($q) {
                $q->whereIn('status', ['warm_up', 'on_court']);
            }])
            ->get();

        return Inertia::render('Organizer/Tournaments/Courts', [
            'tournament' => $tournament,
            'courts' => $courts,
        ]);
    }

    public function store(Request $request, string $tournamentId): RedirectResponse
    {
        $tournament = $this->authorizeTournament($tournamentId);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'surface_type' => 'required|string|max:50',
            'referee_pin' => 'nullable|string|min:4|max:10',
        ]);

        Court::create([
            'tournament_id' => $tournament->id,
            'name' => $validated['name'],
            'surface_type' => $validated['surface_type'],
            'referee_token' => Str::random(40) . Str::random(24),
            'referee_pin' => $validated['referee_pin'] ?? '1234',
            'is_active' => true,
        ]);

        return back()->with('success', 'Lapangan baru berhasil didaftarkan!');
    }

    public function update(Request $request, string $tournamentId, string $courtId): RedirectResponse
    {
        $tournament = $this->authorizeTournament($tournamentId);
        $court = Court::where('tournament_id', $tournament->id)->findOrFail($courtId);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'surface_type' => 'required|string|max:50',
            'referee_pin' => 'required|string|min:4|max:10',
            'is_active' => 'required|boolean',
        ]);

        $court->update($validated);

        return back()->with('success', 'Data lapangan berhasil diperbarui!');
    }

    public function regenerateToken(Request $request, string $tournamentId, string $courtId): RedirectResponse
    {
        $tournament = $this->authorizeTournament($tournamentId);
        $court = Court::where('tournament_id', $tournament->id)->findOrFail($courtId);

        $court->update([
            'referee_token' => Str::random(40) . Str::random(24),
            'referee_pin' => (string) rand(1000, 9999),
        ]);

        return back()->with('success', 'Token wasit & PIN baru berhasil digenerate!');
    }

    public function destroy(string $tournamentId, string $courtId): RedirectResponse
    {
        $tournament = $this->authorizeTournament($tournamentId);
        $court = Court::where('tournament_id', $tournament->id)->findOrFail($courtId);

        if ($court->matches()->whereIn('status', ['on_court', 'warm_up'])->exists()) {
            return back()->with('error', 'Tidak dapat menghapus lapangan yang sedang memiliki pertandingan aktif!');
        }

        $court->delete();

        return back()->with('success', 'Lapangan berhasil dihapus.');
    }
}
