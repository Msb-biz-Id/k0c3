<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\TeamPlayer;
use App\Models\Tournament;
use App\Models\TournamentCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TournamentRegistrationController extends Controller
{
    /**
     * Show 6-step Tournament Registration Wizard.
     */
    public function create(string $slug): Response
    {
        $tournament = Tournament::where('slug', $slug)
            ->orWhere('id', $slug)
            ->with([
                'categories' => function ($q) {
                    $q->with(['tier', 'division', 'skillLevel'])
                        ->withCount('teams');
                }
            ])
            ->firstOrFail();

        return Inertia::render('Public/Tournaments/Register', [
            'tournament' => $tournament,
            'currentUser' => Auth::user(),
        ]);
    }

    /**
     * Process 6-step registration and upload payment transfer receipt.
     */
    public function store(Request $request, string $slug): RedirectResponse
    {
        $tournament = Tournament::where('slug', $slug)->orWhere('id', $slug)->firstOrFail();

        $validated = $request->validate([
            'category_id' => ['required', 'exists:tournament_categories,id'],
            'team_name' => ['required', 'string', 'max:100'],
            // Player 1
            'p1_name' => ['required', 'string', 'max:100'],
            'p1_phone' => ['required', 'string', 'max:30'],
            'p1_email' => ['nullable', 'email'],
            'p1_nik' => ['nullable', 'string', 'max:50'],
            'p1_jersey_size' => ['required', 'string', 'in:S,M,L,XL,XXL'],
            // Player 2
            'p2_name' => ['required', 'string', 'max:100'],
            'p2_phone' => ['required', 'string', 'max:30'],
            'p2_email' => ['nullable', 'email'],
            'p2_nik' => ['nullable', 'string', 'max:50'],
            'p2_jersey_size' => ['required', 'string', 'in:S,M,L,XL,XXL'],
            // Receipt
            'payment_receipt' => ['nullable', 'image', 'max:5120'], // Max 5MB
        ]);

        $category = TournamentCategory::where('tournament_id', $tournament->id)
            ->findOrFail($validated['category_id']);

        $receiptPath = null;
        if ($request->hasFile('payment_receipt')) {
            $receiptPath = $request->file('payment_receipt')->store('receipts', 'public');
        }

        $team = DB::transaction(function () use ($category, $validated, $receiptPath) {
            $team = Team::create([
                'category_id' => $category->id,
                'name' => $validated['team_name'],
                'payment_status' => 'pending',
                'payment_amount' => $category->registration_fee,
                'payment_receipt_url' => $receiptPath,
            ]);

            // Player 1 (Kapten)
            TeamPlayer::create([
                'team_id' => $team->id,
                'user_id' => Auth::id(),
                'player_order' => 1,
                'name' => $validated['p1_name'],
                'phone' => $validated['p1_phone'],
                'email' => $validated['p1_email'] ?? null,
                'nik' => $validated['p1_nik'] ?? null,
                'jersey_size' => $validated['p1_jersey_size'],
            ]);

            // Player 2 (Partner)
            TeamPlayer::create([
                'team_id' => $team->id,
                'player_order' => 2,
                'name' => $validated['p2_name'],
                'phone' => $validated['p2_phone'],
                'email' => $validated['p2_email'] ?? null,
                'nik' => $validated['p2_nik'] ?? null,
                'jersey_size' => $validated['p2_jersey_size'],
            ]);

            return $team;
        });

        return redirect()->route('tournaments.show', $tournament->slug ?: $tournament->id)
            ->with('success', "Pendaftaran tim {$team->name} berhasil dikirim! Menunggu verifikasi pembayaran oleh panitia.");
    }
}
