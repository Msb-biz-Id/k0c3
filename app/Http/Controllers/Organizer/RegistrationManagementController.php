<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationManagementController extends Controller
{
    /**
     * Authorize that the current user owns this tournament or is a superadmin.
     */
    protected function authorizeTournament(string $tournamentId): Tournament
    {
        /** @var User $user */
        $user = Auth::user();
        $tournament = Tournament::with('categories')->findOrFail($tournamentId);

        if ($tournament->user_id !== $user->id && !$user->hasRole('superadmin')) {
            abort(403, 'Akses pendaftaran turnamen ditolak.');
        }

        return $tournament;
    }

    public function index(Request $request, string $tournamentId): Response
    {
        $tournament = $this->authorizeTournament($tournamentId);
        $categoryIds = $tournament->categories->pluck('id');

        $status = $request->query('status', 'all');
        $categoryId = $request->query('category_id', 'all');
        $search = $request->query('search', '');

        $query = Team::whereIn('category_id', $categoryIds)
            ->with(['category', 'teamPlayers'])
            ->latest();

        if ($status !== 'all') {
            $query->where('payment_status', $status);
        }

        if ($categoryId !== 'all') {
            $query->where('category_id', $categoryId);
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('teamPlayers', function ($pq) use ($search) {
                        $pq->where('name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            });
        }

        $teams = $query->paginate(20)->withQueryString();

        // Calculate count per status
        $statusCounts = [
            'all' => Team::whereIn('category_id', $categoryIds)->count(),
            'pending' => Team::whereIn('category_id', $categoryIds)->where('payment_status', 'pending')->count(),
            'verified' => Team::whereIn('category_id', $categoryIds)->where('payment_status', 'verified')->count(),
            'need_refund' => Team::whereIn('category_id', $categoryIds)->where('payment_status', 'need_refund')->count(),
            'refunded' => Team::whereIn('category_id', $categoryIds)->where('payment_status', 'refunded')->count(),
            'rejected' => Team::whereIn('category_id', $categoryIds)->where('payment_status', 'rejected')->count(),
            'cancelled' => Team::whereIn('category_id', $categoryIds)->where('payment_status', 'cancelled')->count(),
            'expired' => Team::whereIn('category_id', $categoryIds)->where('payment_status', 'expired')->count(),
        ];

        return Inertia::render('Organizer/Tournaments/Registrations', [
            'tournament' => $tournament,
            'categories' => $tournament->categories,
            'teams' => $teams,
            'filters' => [
                'status' => $status,
                'category_id' => $categoryId,
                'search' => $search,
            ],
            'statusCounts' => $statusCounts,
        ]);
    }

    public function updateStatus(Request $request, string $tournamentId, string $teamId): RedirectResponse
    {
        $tournament = $this->authorizeTournament($tournamentId);

        $team = Team::whereIn('category_id', $tournament->categories->pluck('id'))
            ->with(['teamPlayers', 'category'])
            ->findOrFail($teamId);

        $validated = $request->validate([
            'status' => 'required|in:verified,rejected,refunded,need_refund,cancelled',
            'notes' => 'nullable|string',
        ]);

        $updateData = [
            'payment_status' => $validated['status'],
            'notes' => $validated['notes'] ?? $team->notes,
        ];

        if ($validated['status'] === 'verified') {
            $updateData['payment_verified_at'] = now();
        }

        $team->update($updateData);

        // Optional WhatsApp Notification
        $this->sendWhatsAppStatusNotification($team, $tournament, $validated['status'], $validated['notes'] ?? null);

        $statusLabels = [
            'verified' => 'diterima & terverifikasi',
            'rejected' => 'ditolak',
            'refunded' => 'ditandai sudah di-refund',
            'need_refund' => 'ditandai perlu refund',
            'cancelled' => 'dibatalkan',
        ];

        return back()->with('success', "Status pendaftaran tim {$team->name} berhasil diubah menjadi {$statusLabels[$validated['status']]}.");
    }

    public function destroy(string $tournamentId, string $teamId): RedirectResponse
    {
        $tournament = $this->authorizeTournament($tournamentId);
        $team = Team::whereIn('category_id', $tournament->categories->pluck('id'))->findOrFail($teamId);
        $team->delete();

        return back()->with('success', 'Data pendaftaran tim berhasil dihapus.');
    }

    private function sendWhatsAppStatusNotification(Team $team, Tournament $tournament, string $status, ?string $reason): void
    {
        $captain = $team->teamPlayers->where('player_order', 1)->first() ?? $team->teamPlayers->first();
        if (!$captain || empty($captain->phone)) {
            return;
        }

        $message = "";
        if ($status === 'verified') {
            $message = "Halo {$captain->name}! Pembayaran pendaftaran tim *{$team->name}* di turnamen *{$tournament->name}* (Kategori {$team->category->name}) telah *BERHASIL DIVERIFIKASI*. Sampai jumpa di lapangan!";
        } elseif ($status === 'rejected') {
            $reasonText = $reason ? "\nAlasan: {$reason}" : "";
            $message = "Halo {$captain->name}. Mohon maaf, pendaftaran tim *{$team->name}* untuk *{$tournament->name}* belum dapat kami terima.{$reasonText}\nSilakan hubungi panitia untuk informasi lebih lanjut.";
        }

        if (!empty($message)) {
            \App\Jobs\SendWhatsAppMessageJob::dispatch($captain->phone, $message, 'registration_' . $status);
        }
    }
}
