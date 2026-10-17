<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PayoutRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PayoutRequestController extends Controller
{
    /**
     * Display EO payout requests ledger.
     */
    public function index(): Response
    {
        $requests = PayoutRequest::with(['tournament', 'organizer'])
            ->latest('created_at')
            ->paginate(15);

        return Inertia::render('Admin/Payouts/Index', [
            'requests' => $requests,
        ]);
    }

    /**
     * Approve or reject payout request and attach transfer proof.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $payout = PayoutRequest::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected,pending'],
            'admin_notes' => ['nullable', 'string', 'max:500'],
            'transfer_receipt' => ['nullable', 'image', 'max:5120'],
        ]);

        $receiptPath = $payout->transfer_receipt_url;
        if ($request->hasFile('transfer_receipt')) {
            $receiptPath = $request->file('transfer_receipt')->store('payouts', 'public');
        }

        $payout->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? null,
            'transfer_receipt_url' => $receiptPath,
            'processed_by' => Auth::id(),
            'processed_at' => now(),
        ]);

        return back()->with('success', 'Status pengajuan pencairan dana berhasil diperbarui.');
    }
}
