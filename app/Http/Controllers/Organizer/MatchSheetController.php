<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\TournamentMatch;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class MatchSheetController extends Controller
{
    /**
     * Download or view official printable match scoresheet PDF.
     */
    public function downloadPdf(string $tournamentId, string $matchId): Response
    {
        $match = TournamentMatch::where('id', $matchId)
            ->with([
                'category.tournament',
                'court',
                'team1.players',
                'team2.players',
                'winnerTeam',
            ])
            ->firstOrFail();

        $tournament = $match->category->tournament;

        if ($tournament->id !== $tournamentId) {
            abort(404, 'Pertandingan tidak ditemukan pada turnamen ini.');
        }

        $user = auth()->user();
        if ($user && !$user->hasRole('superadmin') && $tournament->user_id !== $user->id) {
            abort(403, 'Akses PDF ditolak.');
        }

        $pdf = Pdf::loadView('pdf.match-sheet', [
            'match' => $match,
            'category' => $match->category,
            'tournament' => $tournament,
        ])->setPaper('a4', 'portrait');

        return $pdf->stream("match-sheet-{$match->match_number}.pdf");
    }
}
