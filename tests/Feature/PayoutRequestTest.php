<?php

namespace Tests\Feature;

use App\Models\PayoutRequest;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PayoutRequestTest extends TestCase
{
    use RefreshDatabase;

    protected User $superadmin;
    protected User $organizer;
    protected Tournament $tournament;
    protected PayoutRequest $payout;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'superadmin']);
        Role::firstOrCreate(['name' => 'organizer']);

        $this->superadmin = User::factory()->create();
        $this->superadmin->assignRole('superadmin');

        $this->organizer = User::factory()->create();
        $this->organizer->assignRole('organizer');

        $this->tournament = Tournament::create([
            'user_id' => $this->organizer->id,
            'name' => 'Turnamen Payout Test',
            'slug' => 'turnamen-payout-test',
            'venue_name' => 'Arena Test',
            'city_id' => '3171',
            'city_name' => 'KOTA JAKARTA SELATAN',
            'province_id' => '31',
            'province_name' => 'DKI JAKARTA',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
            'status' => 'completed',
        ]);

        $this->payout = PayoutRequest::create([
            'tournament_id' => $this->tournament->id,
            'user_id' => $this->organizer->id,
            'gross_income' => 10000000,
            'platform_fee' => 500000,
            'net_amount' => 9500000,
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'KOCE EO',
            'status' => 'pending',
        ]);
    }

    public function test_superadmin_can_view_payouts_ledger(): void
    {
        $response = $this->actingAs($this->superadmin)->get(route('admin.payouts.index'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Payouts/Index')
            ->has('requests.data')
        );
    }

    public function test_superadmin_can_approve_payout_with_receipt(): void
    {
        Storage::fake('public');
        $file = UploadedFile::fake()->image('transfer_proof.jpg');

        $response = $this->actingAs($this->superadmin)->put(
            route('admin.payouts.update', $this->payout->id),
            [
                'status' => 'approved',
                'admin_notes' => 'Transfer selesai via KlikBCA Bisnis ref #89281',
                'transfer_receipt' => $file,
            ]
        );

        $response->assertRedirect();
        $this->assertDatabaseHas('payout_requests', [
            'id' => $this->payout->id,
            'status' => 'approved',
            'admin_notes' => 'Transfer selesai via KlikBCA Bisnis ref #89281',
        ]);

        $this->payout->refresh();
        $this->assertNotNull($this->payout->transfer_receipt_url);
        Storage::disk('public')->assertExists($this->payout->transfer_receipt_url);
    }
}
