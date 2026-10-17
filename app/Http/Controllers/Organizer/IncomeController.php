<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\PayoutRequest;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class IncomeController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();

        $tournaments = Tournament::where('user_id', $user->id)
            ->with(['categories.teams' => function ($q) {
                $q->where('payment_status', 'verified');
            }, 'payoutRequests'])
            ->latest()
            ->get();

        $tournamentLedgers = $tournaments->map(function ($t) {
            $grossIncome = 0;
            $verifiedTeamsCount = 0;

            foreach ($t->categories as $category) {
                $count = $category->teams->count();
                $verifiedTeamsCount += $count;
                $grossIncome += ($count * (float) $category->registration_fee);
            }

            $withdrawn = (float) $t->payoutRequests->whereIn('status', ['approved', 'transferred'])->sum('net_amount');
            $pendingPayout = (float) $t->payoutRequests->where('status', 'pending')->sum('net_amount');
            $platformFee = $grossIncome * 0.05; // 5% platform fee
            $netAvailable = max(0, ($grossIncome - $platformFee) - ($withdrawn + $pendingPayout));

            return [
                'id' => $t->id,
                'name' => $t->name,
                'status' => $t->status,
                'start_date' => $t->start_date ? $t->start_date->format('Y-m-d') : null,
                'bank_name' => $t->bank_name,
                'bank_account_number' => $t->bank_account_number,
                'bank_account_holder' => $t->bank_account_holder,
                'verified_teams_count' => $verifiedTeamsCount,
                'gross_income' => $grossIncome,
                'platform_fee' => $platformFee,
                'withdrawn' => $withdrawn,
                'pending_payout' => $pendingPayout,
                'net_available' => $netAvailable,
            ];
        });

        $totalGross = $tournamentLedgers->sum('gross_income');
        $totalPlatformFee = $tournamentLedgers->sum('platform_fee');
        $totalWithdrawn = $tournamentLedgers->sum('withdrawn');
        $totalPending = $tournamentLedgers->sum('pending_payout');
        $totalNetAvailable = $tournamentLedgers->sum('net_available');

        $payoutHistory = PayoutRequest::where('user_id', $user->id)
            ->with('tournament')
            ->latest()
            ->take(20)
            ->get();

        return Inertia::render('Organizer/Income/Index', [
            'ledgers' => $tournamentLedgers,
            'payoutHistory' => $payoutHistory,
            'summary' => [
                'total_gross' => $totalGross,
                'total_platform_fee' => $totalPlatformFee,
                'total_withdrawn' => $totalWithdrawn,
                'total_pending' => $totalPending,
                'total_net_available' => $totalNetAvailable,
            ],
        ]);
    }

    public function storePayout(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'tournament_id' => 'required|exists:tournaments,id',
            'amount' => 'required|numeric|min:50000',
            'bank_name' => 'required|string|max:100',
            'bank_account_number' => 'required|string|max:100',
            'bank_account_holder' => 'required|string|max:255',
        ]);

        $tournament = Tournament::where('user_id', $user->id)->findOrFail($validated['tournament_id']);

        // Calculate available net amount
        $gross = 0;
        foreach ($tournament->categories as $category) {
            $count = $category->teams()->where('payment_status', 'verified')->count();
            $gross += ($count * (float) $category->registration_fee);
        }

        $fee = $gross * 0.05;
        $alreadyRequested = (float) $tournament->payoutRequests()->whereIn('status', ['pending', 'approved', 'transferred'])->sum('net_amount');
        $maxAvailable = max(0, ($gross - $fee) - $alreadyRequested);

        if ($validated['amount'] > $maxAvailable) {
            return back()->with('error', 'Jumlah penarikan melebihi saldo dana turnamen yang tersedia (Rp ' . number_format($maxAvailable, 0, ',', '.') . ').');
        }

        PayoutRequest::create([
            'tournament_id' => $tournament->id,
            'user_id' => $user->id,
            'gross_income' => $validated['amount'] / 0.95,
            'platform_fee' => ($validated['amount'] / 0.95) * 0.05,
            'net_amount' => $validated['amount'],
            'bank_name' => $validated['bank_name'],
            'bank_account_number' => $validated['bank_account_number'],
            'bank_account_holder' => $validated['bank_account_holder'],
            'status' => 'pending',
        ]);

        return back()->with('success', 'Permintaan penarikan dana berhasil diajukan! Tim finance akan memproses verifikasi.');
    }
}
