<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImpersonationController extends Controller
{
    /**
     * Superadmin impersonates another user (e.g. an EO).
     */
    public function impersonate(Request $request, User $user): RedirectResponse
    {
        /** @var \App\Models\User|null $currentUser */
        $currentUser = Auth::user();

        if (!$currentUser || !$currentUser->hasRole('superadmin')) {
            abort(403, 'Akses khusus Superadmin.');
        }

        // Store original superadmin ID in session
        session(['impersonated_by' => $currentUser->id]);

        Auth::login($user);

        return redirect()->route('dashboard')->with('success', "Sedang login sebagai {$user->name}.");
    }

    /**
     * Leave impersonation and return to Superadmin.
     */
    public function leave(Request $request): RedirectResponse
    {
        $originalAdminId = session('impersonated_by');

        if (!$originalAdminId) {
            return redirect()->route('dashboard');
        }

        $admin = User::findOrFail($originalAdminId);

        session()->forget('impersonated_by');
        Auth::login($admin);

        return redirect()->route('admin.master.index')->with('success', 'Kembali ke sesi Superadmin.');
    }
}
