<?php

namespace Tests\Feature;

use App\Models\CompanySetting;
use App\Models\HeroSlide;
use App\Models\PartnerSlide;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CompanyProfileAndSeoTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $player;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'superadmin']);
        Role::firstOrCreate(['name' => 'player']);

        $this->superAdmin = User::factory()->create([
            'email' => 'admin@padelgigs.id',
        ]);
        $this->superAdmin->assignRole('superadmin');

        $this->player = User::factory()->create([
            'email' => 'player@padelgigs.id',
        ]);
        $this->player->assignRole('player');
    }

    public function test_only_superadmin_can_access_company_settings(): void
    {
        $response = $this->actingAs($this->player)->get(route('admin.company.index'));
        $response->assertStatus(403);

        $response = $this->actingAs($this->superAdmin)->get(route('admin.company.index'));
        $response->assertStatus(200);
    }

    public function test_superadmin_can_update_company_profile(): void
    {
        Storage::fake('public');

        $logoDark = UploadedFile::fake()->image('logo_dark.png', 400, 100);
        $favicon = UploadedFile::fake()->image('favicon.png', 32, 32);

        $payload = [
            'company_name' => 'Koceevent Global',
            'tagline' => 'Premier Tournament Network',
            'about_text' => 'Platform resmi kejuaraan olahraga terlengkap.',
            'base_url' => 'https://turnamen.koceevent.com',
            'primary_color' => 'violet',
            'custom_color_hex' => '#8b5cf6',
            'typography_preset' => 'clean_tech',
            'email' => 'contact@koceevent.com',
            'phone' => '+62 811-2233-4455',
            'whatsapp_number' => '6281122334455',
            'address' => 'Jakarta Tournament Center, Senayan',
            'social_links' => [
                'instagram' => 'https://instagram.com/koceevent_official',
                'tiktok' => 'https://tiktok.com/@koceevent',
            ],
            'logo_dark' => $logoDark,
            'favicon' => $favicon,
        ];

        $response = $this->actingAs($this->superAdmin)->put(route('admin.company.update'), $payload);
        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('company_settings', [
            'company_name' => 'Koceevent Global',
            'base_url' => 'https://turnamen.koceevent.com',
            'primary_color' => 'violet',
            'custom_color_hex' => '#8b5cf6',
            'typography_preset' => 'clean_tech',
            'email' => 'contact@koceevent.com',
            'whatsapp_number' => '6281122334455',
        ]);

        $settings = CompanySetting::first();
        $this->assertNotNull($settings->logo_dark_path);
        $this->assertNotNull($settings->favicon_path);
        Storage::disk('public')->assertExists($settings->logo_dark_path);
        Storage::disk('public')->assertExists($settings->favicon_path);
    }

    public function test_superadmin_can_update_global_seo_metadata(): void
    {
        Storage::fake('public');
        $ogImage = UploadedFile::fake()->image('og_banner.jpg', 1200, 630);

        $payload = [
            'meta_title' => 'Koceevent - Kejuaraan Olahraga Terbesar',
            'meta_description' => 'Ikuti turnamen di seluruh kota Indonesia dengan live scoring real-time.',
            'keywords' => 'turnamen, kejuaraan, event olahraga',
            'twitter_card' => 'summary_large_image',
            'google_site_verification' => 'google-test-token-123',
            'google_analytics_id' => 'G-TRACKING999',
            'og_image' => $ogImage,
        ];

        $response = $this->actingAs($this->superAdmin)->put(route('admin.company.seo.update'), $payload);
        $response->assertRedirect();
        $response->assertSessionHas('success');

        $settings = CompanySetting::first();
        $this->assertEquals('Koceevent - Kejuaraan Olahraga Terbesar', $settings->seo_meta['meta_title']);
        $this->assertEquals('google-test-token-123', $settings->seo_meta['google_site_verification']);
        $this->assertEquals('G-TRACKING999', $settings->seo_meta['google_analytics_id']);
        $this->assertNotNull($settings->seo_meta['og_image_path']);
        Storage::disk('public')->assertExists($settings->seo_meta['og_image_path']);
    }

    public function test_superadmin_can_manage_hero_slides(): void
    {
        Storage::fake('public');
        $banner = UploadedFile::fake()->image('hero_banner.jpg', 1920, 1080);

        // 1. Store
        $response = $this->actingAs($this->superAdmin)->post(route('admin.company.hero.store'), [
            'badge_text' => 'National Championship 2026',
            'title' => 'Grand Padel Slam',
            'subtitle' => 'Turnamen terbesar tahun ini.',
            'cta_text' => 'Daftar Sekarang',
            'cta_link' => '/tournaments/grand-slam',
            'sort_order' => 1,
            'is_active' => true,
            'image' => $banner,
        ]);
        $response->assertRedirect();
        $response->assertSessionHas('success');

        $slide = HeroSlide::where('title', 'Grand Padel Slam')->first();
        $this->assertNotNull($slide);
        $this->assertTrue($slide->is_active);
        $this->assertNotNull($slide->image_path);
        Storage::disk('public')->assertExists($slide->image_path);

        // 2. Toggle Status
        $this->actingAs($this->superAdmin)->patch(route('admin.company.hero.toggle-status', $slide->id));
        $this->assertFalse($slide->fresh()->is_active);

        // 3. Update
        $this->actingAs($this->superAdmin)->put(route('admin.company.hero.update', $slide->id), [
            'title' => 'Grand Padel Slam Updated',
            'cta_text' => 'Lihat Jadwal',
            'sort_order' => 2,
        ]);
        $this->assertEquals('Grand Padel Slam Updated', $slide->fresh()->title);

        // 4. Destroy
        $this->actingAs($this->superAdmin)->delete(route('admin.company.hero.destroy', $slide->id));
        $this->assertDatabaseMissing('hero_slides', ['id' => $slide->id]);
    }

    public function test_superadmin_can_manage_partner_slides(): void
    {
        Storage::fake('public');
        $logo = UploadedFile::fake()->image('bullpadel.png', 300, 150);

        // 1. Store
        $response = $this->actingAs($this->superAdmin)->post(route('admin.company.partners.store'), [
            'name' => 'Bullpadel Official',
            'tier' => 'official_racket',
            'website_url' => 'https://bullpadel.com',
            'sort_order' => 1,
            'is_active' => true,
            'logo' => $logo,
        ]);
        $response->assertRedirect();
        $response->assertSessionHas('success');

        $partner = PartnerSlide::where('name', 'Bullpadel Official')->first();
        $this->assertNotNull($partner);
        $this->assertTrue($partner->is_active);
        $this->assertNotNull($partner->logo_path);
        Storage::disk('public')->assertExists($partner->logo_path);

        // 2. Toggle Status
        $this->actingAs($this->superAdmin)->patch(route('admin.company.partners.toggle-status', $partner->id));
        $this->assertFalse($partner->fresh()->is_active);

        // 3. Update
        $this->actingAs($this->superAdmin)->put(route('admin.company.partners.update', $partner->id), [
            'name' => 'Bullpadel Global',
            'tier' => 'platinum',
            'website_url' => 'https://bullpadel.com/global',
        ]);
        $this->assertEquals('Bullpadel Global', $partner->fresh()->name);
        $this->assertEquals('platinum', $partner->fresh()->tier);

        // 4. Destroy
        $this->actingAs($this->superAdmin)->delete(route('admin.company.partners.destroy', $partner->id));
        $this->assertDatabaseMissing('partner_slides', ['id' => $partner->id]);
    }

    public function test_public_homepage_renders_hero_slides_and_partner_slides(): void
    {
        HeroSlide::create([
            'title' => 'Turnamen Terbuka Jakarta 2026',
            'subtitle' => 'Pendaftaran dibuka untuk kategori Open.',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        PartnerSlide::create([
            'name' => 'Babolat Sports',
            'tier' => 'official_ball',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Welcome')
                ->has('heroSlides')
                ->has('partnerSlides')
                ->has('company')
        );
    }

    public function test_superadmin_can_toggle_preloader_setting(): void
    {
        // Default is true
        $this->assertTrue(CompanySetting::getSettings()->enable_preloader);

        // Turn OFF preloader
        $response = $this->actingAs($this->superAdmin)->put(route('admin.company.update'), [
            'company_name' => 'Koceevent Indonesia',
            'enable_preloader' => false,
        ]);
        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertFalse(CompanySetting::getSettings()->enable_preloader);

        // Verify Inertia shares preloader state
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->where('company.enable_preloader', false)
        );

        // Turn ON preloader
        $this->actingAs($this->superAdmin)->put(route('admin.company.update'), [
            'company_name' => 'Koceevent Indonesia',
            'enable_preloader' => true,
        ]);
        $this->assertTrue(CompanySetting::getSettings()->enable_preloader);
    }

    public function test_company_setting_defaults_to_koceevent_and_dynamic_theme(): void
    {
        $settings = CompanySetting::getSettings();

        $this->assertEquals('Koceevent', $settings->company_name);
        $this->assertEquals(config('app.url', 'https://koceevent.com'), $settings->base_url);
        $this->assertEquals('lime', $settings->primary_color);
        $this->assertEquals('#a3e635', $settings->custom_color_hex);
        $this->assertEquals('athletic_broadcast', $settings->typography_preset);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->where('company.company_name', 'Koceevent')
                ->where('company.primary_color', 'lime')
                ->where('company.typography_preset', 'athletic_broadcast')
        );
    }
}
