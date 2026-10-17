<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\MasterSkillLevel;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class PlayerRegisteredUserController extends Controller
{
    /**
     * Display the dedicated player athlete registration view.
     */
    public function create(): Response
    {
        $skillLevels = MasterSkillLevel::where('is_active', true)->orderBy('sort_order')->get();
        $provinces = DB::table('indonesia_provinces')->select('code as id', 'name')->orderBy('name', 'asc')->get();

        return Inertia::render('Auth/PlayerRegister', [
            'skillLevels' => $skillLevels,
            'provinces' => $provinces,
        ]);
    }

    /**
     * Handle an incoming player athlete registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => 'required|string|max:30',
            'gender' => 'required|in:male,female',
            'skill_level' => 'required|string|max:100',
            'preferred_side' => 'required|in:left,right,both',
            'dominant_hand' => 'required|in:right,left,ambidextrous',
            'playtomic_rating' => 'nullable|numeric|between:0,7.0',
            'city_id' => 'nullable|string',
            'city_name' => 'nullable|string|max:100',
            'bio' => 'nullable|string|max:500',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'gender' => $request->gender,
            'skill_level' => $request->skill_level,
            'preferred_side' => $request->preferred_side,
            'dominant_hand' => $request->dominant_hand,
            'playtomic_rating' => $request->playtomic_rating,
            'city_id' => $request->city_id,
            'city_name' => $request->city_name,
            'bio' => $request->bio,
            'is_active' => true,
        ]);

        $user->assignRole('player');

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('leaderboard'))->with('success', 'Selamat datang di PadelGigs! Profil atlet Anda berhasil dibuat.');
    }
}
