<?php

namespace Tests\Feature;

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\User;
use App\Models\WhatsAppConfig;
use App\Models\WhatsAppLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class WhatsAppAndBlogTest extends TestCase
{
    use RefreshDatabase;

    protected User $superadmin;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'superadmin']);

        $this->superadmin = User::factory()->create();
        $this->superadmin->assignRole('superadmin');
    }

    public function test_superadmin_can_view_and_update_whatsapp_settings(): void
    {
        $response = $this->actingAs($this->superadmin)->get(route('admin.whatsapp.index'));
        $response->assertOk();

        $updateResponse = $this->actingAs($this->superadmin)->put(
            route('admin.whatsapp.update'),
            [
                'base_url' => 'https://api.sidobe.com',
                'api_token' => 'test-sidobe-secret-token',
                'device_id' => 'device-padelgigs-01',
                'is_active' => true,
            ]
        );

        $updateResponse->assertRedirect();
        $this->assertDatabaseHas('whatsapp_configs', [
            'api_token' => 'test-sidobe-secret-token',
            'device_id' => 'device-padelgigs-01',
            'is_active' => 1,
        ]);
    }

    public function test_superadmin_can_send_sandbox_test_whatsapp_message(): void
    {
        $response = $this->actingAs($this->superadmin)->post(
            route('admin.whatsapp.test'),
            [
                'phone' => '081234567890',
                'message' => 'Test message from Superadmin sandbox',
            ]
        );

        $response->assertRedirect();
        $this->assertDatabaseHas('whatsapp_logs', [
            'phone' => '6281234567890',
            'event_type' => 'sandbox_test',
            'status' => 'sent',
        ]);
    }

    public function test_superadmin_can_create_blog_article_with_anti_xss(): void
    {
        $category = BlogCategory::create([
            'name' => 'Tips & Trik',
            'slug' => 'tips-trik',
        ]);

        $xssContent = '<p>Halo Padel!<script>alert("XSS")</script></p>';

        $response = $this->actingAs($this->superadmin)->post(
            route('admin.blog.store'),
            [
                'title' => 'Tips Servis Golden Point',
                'category_id' => $category->id,
                'excerpt' => 'Ringkasan tips servis padel...',
                'content' => $xssContent,
                'status' => 'published',
            ]
        );

        $response->assertRedirect(route('admin.blog.index'));

        $this->assertDatabaseHas('blog_posts', [
            'title' => 'Tips Servis Golden Point',
            'slug' => 'tips-servis-golden-point',
            'status' => 'published',
        ]);

        // Verifikasi tag <script> dibersihkan oleh HTMLPurifier
        $post = BlogPost::where('slug', 'tips-servis-golden-point')->first();
        $this->assertStringNotContainsString('<script>', $post->content);
        $this->assertStringContainsString('<p>Halo Padel!</p>', $post->content);
    }

    public function test_public_can_view_blog_index_and_read_article(): void
    {
        $post = BlogPost::create([
            'author_id' => $this->superadmin->id,
            'title' => 'Kabar Kejuaraan Nasional 2026',
            'slug' => 'kabar-kejuaraan-nasional-2026',
            'content' => '<p>Artikel kejuaraan nasional lengkap.</p>',
            'status' => 'published',
            'published_at' => now(),
        ]);

        // 1. Index
        $indexResponse = $this->get(route('blog.index'));
        $indexResponse->assertOk();

        // 2. Read single
        $showResponse = $this->get(route('blog.show', $post->slug));
        $showResponse->assertOk();
        $showResponse->assertInertia(fn ($page) => $page
            ->component('Public/Blog/Show')
            ->has('post')
        );
    }
}
