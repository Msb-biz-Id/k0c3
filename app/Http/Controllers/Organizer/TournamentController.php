<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organizer\StoreTournamentRequest;
use App\Models\Court;
use App\Models\MasterDivision;
use App\Models\MasterSkillLevel;
use App\Models\MasterTier;
use App\Models\Tournament;
use App\Models\TournamentCategory;
use App\Models\TournamentImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Mews\Purifier\Facades\Purifier;

class TournamentController extends Controller
{
    /**
     * Display listing of organizer tournaments.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $search = $request->query('search');
        $status = $request->query('status');

        $query = Tournament::query()
            ->with(['featuredImage', 'categories', 'courts'])
            ->withCount(['categories', 'courts']);

        // Jika bukan superadmin, hanya tampilkan turnamen milik EO terkait
        if (!$user->hasRole('superadmin')) {
            $query->where('user_id', $user->id);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('venue_name', 'like', "%{$search}%")
                  ->orWhere('city_name', 'like', "%{$search}%");
            });
        }

        if ($status && in_array($status, ['draft', 'published', 'ongoing', 'completed'])) {
            $query->where('status', $status);
        }

        $tournaments = $query->latest('start_date')->paginate(10)->withQueryString();

        return Inertia::render('Organizer/Tournaments/Index', [
            'tournaments' => $tournaments,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Show tournament creation wizard.
     */
    public function create(): Response
    {
        $tiers = MasterTier::active()->get(['id', 'name', 'slug', 'badge_color']);
        $divisions = MasterDivision::active()->get(['id', 'name', 'slug', 'gender_restriction']);
        $skillLevels = MasterSkillLevel::active()->get(['id', 'name', 'slug', 'min_rating', 'max_rating']);

        return Inertia::render('Organizer/Tournaments/Create', [
            'masterTiers' => $tiers,
            'masterDivisions' => $divisions,
            'masterSkillLevels' => $skillLevels,
        ]);
    }

    /**
     * Store new tournament with categories, courts, and multi-image gallery.
     */
    public function store(StoreTournamentRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = Auth::user();

        $tournament = DB::transaction(function () use ($validated, $user, $request) {
            // 1. Generate unique slug
            $baseSlug = Str::slug($validated['name']);
            $slug = $baseSlug;
            $count = 1;
            while (Tournament::where('slug', $slug)->exists()) {
                $slug = "{$baseSlug}-{$count}";
                $count++;
            }

            // 2. Sanitize TipTap guide HTML
            $sanitizedGuide = !empty($validated['registration_guide']) 
                ? Purifier::clean($validated['registration_guide']) 
                : null;

            $sanitizedDescription = !empty($validated['description'])
                ? Purifier::clean($validated['description'])
                : null;

            // 3. Create Tournament
            $tournament = Tournament::create([
                'user_id' => $user->id,
                'name' => $validated['name'],
                'slug' => $slug,
                'sport_type' => $validated['sport_type'],
                'description' => $sanitizedDescription,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'registration_deadline' => $validated['registration_deadline'] ?? null,
                'registration_guide' => $sanitizedGuide,
                'venue_name' => $validated['venue_name'],
                'venue_address' => $validated['venue_address'] ?? null,
                'province_id' => $validated['province_id'] ?? null,
                'province_name' => $validated['province_name'] ?? null,
                'city_id' => $validated['city_id'] ?? null,
                'city_name' => $validated['city_name'] ?? null,
                'google_maps_url' => $validated['google_maps_url'] ?? null,
                'bank_name' => $validated['bank_name'],
                'bank_account_number' => $validated['bank_account_number'],
                'bank_account_holder' => $validated['bank_account_holder'],
                'status' => 'draft',
            ]);

            // 4. Create Categories with Snapshot Integrity
            foreach ($validated['categories'] as $catData) {
                $tier = !empty($catData['tier_id']) ? MasterTier::find($catData['tier_id']) : null;
                $division = !empty($catData['division_id']) ? MasterDivision::find($catData['division_id']) : null;
                $skill = !empty($catData['skill_level_id']) ? MasterSkillLevel::find($catData['skill_level_id']) : null;

                TournamentCategory::create([
                    'tournament_id' => $tournament->id,
                    'name' => $catData['name'],
                    'tier_id' => $tier?->id,
                    'tier_name' => $tier?->name, // Snapshot
                    'division_id' => $division?->id,
                    'division_name' => $division?->name, // Snapshot
                    'skill_level_id' => $skill?->id,
                    'skill_level_name' => $skill?->name, // Snapshot
                    'max_teams' => $catData['max_teams'],
                    'registration_fee' => $catData['registration_fee'],
                    'format' => $catData['format'],
                    'is_open_registration' => $catData['is_open_registration'] ?? true,
                ]);
            }

            // 5. Create Courts (if provided, or default 2 courts)
            $courtsToCreate = !empty($validated['courts']) ? $validated['courts'] : [
                ['name' => 'Lapangan 1', 'surface_type' => 'panoramic_turf'],
                ['name' => 'Lapangan 2', 'surface_type' => 'panoramic_turf'],
            ];

            foreach ($courtsToCreate as $courtData) {
                Court::create([
                    'tournament_id' => $tournament->id,
                    'name' => $courtData['name'],
                    'surface_type' => $courtData['surface_type'] ?? 'panoramic_turf',
                ]);
            }

            // 6. Handle Multi-Image Uploads
            if ($request->hasFile('images')) {
                $featuredIndex = (int) ($validated['featured_image_index'] ?? 0);

                foreach ($request->file('images') as $index => $imageFile) {
                    $path = $imageFile->store("tournaments/{$tournament->id}", 'public');
                    
                    TournamentImage::create([
                        'tournament_id' => $tournament->id,
                        'image_path' => '/storage/' . $path,
                        'is_featured' => ($index === $featuredIndex),
                        'sort_order' => $index + 1,
                    ]);
                }
            }

            return $tournament;
        });

        return redirect()->route('organizer.tournaments.show', $tournament->id)
            ->with('success', 'Turnamen berhasil dibuat sebagai Draft. Anda dapat mengelola kategori dan jadwal.');
    }

    /**
     * Display the tournament operational control center.
     */
    public function show(string $id): Response
    {
        $user = Auth::user();

        $query = Tournament::query()
            ->with([
                'featuredImage',
                'images',
                'categories.tier',
                'categories.division',
                'categories.skillLevel',
                'categories.teams',
                'courts',
            ]);

        if (!$user->hasRole('superadmin')) {
            $query->where('user_id', $user->id);
        }

        $tournament = $query->findOrFail($id);

        // Agregasi Statistik Ringkas
        $totalCategories = $tournament->categories->count();
        $totalCourts = $tournament->courts->count();
        $totalTeams = $tournament->categories->sum(function ($cat) {
            return $cat->teams->count();
        });
        $verifiedTeams = $tournament->categories->sum(function ($cat) {
            return $cat->teams->where('payment_status', 'verified')->count();
        });

        return Inertia::render('Organizer/Tournaments/Show', [
            'tournament' => $tournament,
            'stats' => [
                'totalCategories' => $totalCategories,
                'totalCourts' => $totalCourts,
                'totalTeams' => $totalTeams,
                'verifiedTeams' => $verifiedTeams,
            ],
        ]);
    }

    /**
     * Publish tournament to public.
     */
    public function publish(string $id): RedirectResponse
    {
        $user = Auth::user();
        $query = Tournament::where('id', $id);

        if (!$user->hasRole('superadmin')) {
            $query->where('user_id', $user->id);
        }

        $tournament = $query->firstOrFail();

        if ($tournament->categories()->count() === 0) {
            return back()->with('error', 'Turnamen harus memiliki minimal 1 kategori sebelum dipublikasikan.');
        }

        $tournament->status = 'published';
        $tournament->save();

        return back()->with('success', 'Turnamen resmi dipublikasikan ke portal publik.');
    }

    /**
     * Soft delete tournament.
     */
    public function destroy(string $id): RedirectResponse
    {
        $user = Auth::user();
        $query = Tournament::where('id', $id);

        if (!$user->hasRole('superadmin')) {
            $query->where('user_id', $user->id);
        }

        $tournament = $query->firstOrFail();
        $tournament->delete();

        return redirect()->route('organizer.tournaments.index')->with('success', 'Turnamen berhasil dihapus.');
    }
}
