<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\ScoreLog;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ScoreLogsController extends Controller
{
    public function index(Request $request, string $tournamentId): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $tournament = Tournament::with(['categories', 'courts'])->findOrFail($tournamentId);

        if ($tournament->user_id !== $user->id && !$user->hasRole('superadmin')) {
            abort(403, 'Akses log skor turnamen ditolak.');
        }

        $categoryIds = $tournament->categories->pluck('id');
        $actionType = $request->query('action_type', 'all');

        $query = ScoreLog::whereHas('match', function ($q) use ($categoryIds) {
            $q->whereIn('category_id', $categoryIds);
        })
        ->with(['match.category', 'match.team1', 'match.team2', 'user'])
        ->latest('created_at');

        if ($actionType !== 'all') {
            $query->where('action_type', $actionType);
        }

        $logs = $query->paginate(30)->withQueryString();

        return Inertia::render('Organizer/Tournaments/ScoreLogs', [
            'tournament' => $tournament,
            'logs' => $logs,
            'filters' => [
                'action_type' => $actionType,
            ],
        ]);
    }
}
