<?php

namespace Tests\Feature;

use App\Models\MasterTier;
use App\Models\MasterDivision;
use App\Models\MasterSkillLevel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class MasterDataTest extends TestCase
{
    use RefreshDatabase;

    protected User $superadmin;
    protected User $eo;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'superadmin']);
        Role::firstOrCreate(['name' => 'organizer']);

        $this->superadmin = User::factory()->create([
            'name' => 'Admin Test',
            'email' => 'admin_test@padelgigs.id',
        ]);
        $this->superadmin->assignRole('superadmin');

        $this->eo = User::factory()->create([
            'name' => 'EO Test',
            'email' => 'eo_test@padelgigs.id',
        ]);
        $this->eo->assignRole('organizer');
    }

    public function test_non_superadmin_cannot_access_master_data(): void
    {
        $response = $this->actingAs($this->eo)->get('/admin/master');
        $response->assertStatus(403);
    }

    public function test_superadmin_can_access_master_data(): void
    {
        $response = $this->actingAs($this->superadmin)->get('/admin/master');
        $response->assertStatus(200);
    }

    public function test_superadmin_can_create_tier(): void
    {
        $response = $this->actingAs($this->superadmin)->post('/admin/master/tiers', [
            'name' => 'Major Championship',
            'slug' => 'major-championship',
            'badge_color' => '#f43f5e',
            'description' => 'Turnamen tingkat tertinggi',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('master_tiers', [
            'name' => 'Major Championship',
            'slug' => 'major-championship',
        ]);
    }

    public function test_superadmin_can_toggle_tier_status(): void
    {
        $tier = MasterTier::create([
            'name' => 'Test Mini',
            'slug' => 'test-mini',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->superadmin)->patch("/admin/master/tiers/{$tier->id}/toggle-status");
        $response->assertRedirect();

        $this->assertFalse($tier->fresh()->is_active);
    }

    public function test_superadmin_can_soft_delete_tier(): void
    {
        $tier = MasterTier::create([
            'name' => 'Obsolete Tier',
            'slug' => 'obsolete-tier',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->superadmin)->delete("/admin/master/tiers/{$tier->id}");
        $response->assertRedirect();

        $this->assertSoftDeleted('master_tiers', ['id' => $tier->id]);
    }

    public function test_superadmin_can_impersonate_and_leave(): void
    {
        // 1. Impersonate EO
        $response = $this->actingAs($this->superadmin)->post("/admin/impersonate/{$this->eo->id}");
        $response->assertRedirect(route('dashboard'));
        $this->assertEquals($this->eo->id, auth()->id());
        $this->assertTrue(session()->has('impersonated_by'));

        // 2. Leave impersonation
        $leaveResponse = $this->post('/leave-impersonation');
        $leaveResponse->assertRedirect(route('admin.master.index'));
        $this->assertEquals($this->superadmin->id, auth()->id());
        $this->assertFalse(session()->has('impersonated_by'));
    }
}
