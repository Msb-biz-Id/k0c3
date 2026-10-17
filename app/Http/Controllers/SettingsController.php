<?php

namespace App\Http\Controllers;

use App\Models\MasterSkillLevel;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Athlete & User Profile Settings.
     */
    public function profile(Request $request): Response
    {
        $skillLevels = MasterSkillLevel::where('is_active', true)->orderBy('sort_order')->get(['id', 'name']);
        $provinces = DB::table('indonesia_provinces')->select('code as id', 'name')->orderBy('name', 'asc')->get();

        return Inertia::render('Settings/Profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'skillLevels' => $skillLevels,
            'provinces' => $provinces,
        ]);
    }

    /**
     * Password & Account Security Settings.
     */
    public function password(): Response
    {
        return Inertia::render('Settings/Password', [
            'status' => session('status'),
        ]);
    }

    /**
     * Appearance & Theme Settings.
     */
    public function appearance(): Response
    {
        return Inertia::render('Settings/Appearance');
    }
}
