<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MasterDivisionRequest;
use App\Http\Requests\Admin\MasterSkillLevelRequest;
use App\Http\Requests\Admin\MasterTierRequest;
use App\Models\MasterDivision;
use App\Models\MasterSkillLevel;
use App\Models\MasterTier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MasterDataController extends Controller
{
    /**
     * Display the dynamic master data hub (Tiers, Divisions, Skill Levels).
     */
    public function index(): Response
    {
        $tiers = MasterTier::withCount('categories')
            ->orderBy('sort_order', 'asc')
            ->get();

        $divisions = MasterDivision::withCount('categories')
            ->orderBy('sort_order', 'asc')
            ->get();

        $skillLevels = MasterSkillLevel::withCount('categories')
            ->orderBy('sort_order', 'asc')
            ->get();

        return Inertia::render('Admin/Master/Index', [
            'tiers' => $tiers,
            'divisions' => $divisions,
            'skillLevels' => $skillLevels,
        ]);
    }

    // ==========================================
    // TIER CRUD
    // ==========================================

    public function storeTier(MasterTierRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        if (!isset($validated['sort_order'])) {
            $validated['sort_order'] = (MasterTier::max('sort_order') ?? 0) + 1;
        }

        MasterTier::create($validated);

        return back()->with('success', 'Tier turnamen berhasil ditambahkan.');
    }

    public function updateTier(MasterTierRequest $request, string $id): RedirectResponse
    {
        $tier = MasterTier::findOrFail($id);
        $validated = $request->validated();
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $tier->update($validated);

        return back()->with('success', 'Tier turnamen berhasil diperbarui.');
    }

    public function toggleTierStatus(string $id): RedirectResponse
    {
        $tier = MasterTier::findOrFail($id);
        $tier->is_active = !$tier->is_active;
        $tier->save();

        return back()->with('success', 'Status tier berhasil diperbarui.');
    }

    public function destroyTier(string $id): RedirectResponse
    {
        $tier = MasterTier::findOrFail($id);
        $tier->delete(); // SoftDeletes: past tournaments keep snapshot name & FK integrity

        return back()->with('success', 'Tier berhasil diarsipkan.');
    }

    // ==========================================
    // DIVISION CRUD
    // ==========================================

    public function storeDivision(MasterDivisionRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        if (!isset($validated['sort_order'])) {
            $validated['sort_order'] = (MasterDivision::max('sort_order') ?? 0) + 1;
        }

        MasterDivision::create($validated);

        return back()->with('success', 'Divisi baru berhasil ditambahkan.');
    }

    public function updateDivision(MasterDivisionRequest $request, string $id): RedirectResponse
    {
        $division = MasterDivision::findOrFail($id);
        $validated = $request->validated();
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $division->update($validated);

        return back()->with('success', 'Divisi berhasil diperbarui.');
    }

    public function toggleDivisionStatus(string $id): RedirectResponse
    {
        $division = MasterDivision::findOrFail($id);
        $division->is_active = !$division->is_active;
        $division->save();

        return back()->with('success', 'Status divisi berhasil diperbarui.');
    }

    public function destroyDivision(string $id): RedirectResponse
    {
        $division = MasterDivision::findOrFail($id);
        $division->delete();

        return back()->with('success', 'Divisi berhasil diarsipkan.');
    }

    // ==========================================
    // SKILL LEVEL CRUD
    // ==========================================

    public function storeSkillLevel(MasterSkillLevelRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        if (!isset($validated['sort_order'])) {
            $validated['sort_order'] = (MasterSkillLevel::max('sort_order') ?? 0) + 1;
        }

        MasterSkillLevel::create($validated);

        return back()->with('success', 'Level skill baru berhasil ditambahkan.');
    }

    public function updateSkillLevel(MasterSkillLevelRequest $request, string $id): RedirectResponse
    {
        $skillLevel = MasterSkillLevel::findOrFail($id);
        $validated = $request->validated();
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $skillLevel->update($validated);

        return back()->with('success', 'Level skill berhasil diperbarui.');
    }

    public function toggleSkillLevelStatus(string $id): RedirectResponse
    {
        $skillLevel = MasterSkillLevel::findOrFail($id);
        $skillLevel->is_active = !$skillLevel->is_active;
        $skillLevel->save();

        return back()->with('success', 'Status level skill berhasil diperbarui.');
    }

    public function destroySkillLevel(string $id): RedirectResponse
    {
        $skillLevel = MasterSkillLevel::findOrFail($id);
        $skillLevel->delete();

        return back()->with('success', 'Level skill berhasil diarsipkan.');
    }

    // ==========================================
    // BATCH REORDER API (DRAG & DROP)
    // ==========================================

    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:tiers,divisions,skill_levels'],
            'ordered_ids' => ['required', 'array'],
            'ordered_ids.*' => ['required', 'uuid'],
        ]);

        $table = match ($validated['type']) {
            'tiers' => 'master_tiers',
            'divisions' => 'master_divisions',
            'skill_levels' => 'master_skill_levels',
        };

        DB::transaction(function () use ($table, $validated) {
            foreach ($validated['ordered_ids'] as $index => $id) {
                DB::table($table)
                    ->where('id', $id)
                    ->update(['sort_order' => $index + 1]);
            }
        });

        return back()->with('success', 'Urutan tampilan berhasil disimpan.');
    }
}
