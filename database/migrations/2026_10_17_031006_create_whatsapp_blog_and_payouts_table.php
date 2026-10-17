<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. WhatsApp Configs (sidobe.com)
        Schema::create('whatsapp_configs', function (Blueprint $table) {
            $table->id();
            $table->string('base_url')->default('https://api.sidobe.com');
            $table->string('api_token', 255)->nullable();
            $table->string('device_id', 100)->nullable();
            $table->string('webhook_key', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('templates')->nullable(); // JSON templates for registration, court call, match result
            $table->timestamps();
        });

        // 2. WhatsApp Logs Table
        Schema::create('whatsapp_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('phone', 30);
            $table->text('message');
            $table->string('event_type', 50); // registration_approved, court_call, match_result, otp
            $table->string('status', 30)->default('pending'); // pending, sent, delivered, failed
            $table->json('payload_request')->nullable();
            $table->json('api_response')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });

        // 3. Blog Categories
        Schema::create('blog_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->timestamps();
        });

        // 4. Blog Posts
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('category_id')->nullable()->constrained('blog_categories')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('featured_image')->nullable();
            $table->text('excerpt')->nullable();
            $table->longText('content'); // TipTap Rich Text (Sanitized with HTMLPurifier)
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('status', 30)->default('draft'); // draft, published, archived
            $table->dateTime('published_at')->nullable();
            $table->timestamps();
        });

        // 5. Payout Requests (Finansial Penarikan Dana EO)
        Schema::create('payout_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tournament_id')->constrained('tournaments')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Organizer
            $table->decimal('gross_income', 14, 2);
            $table->decimal('platform_fee', 14, 2)->default(0);
            $table->decimal('net_amount', 14, 2);
            $table->string('bank_name', 100);
            $table->string('bank_account_number', 100);
            $table->string('bank_account_holder', 255);
            $table->string('status', 30)->default('pending'); // pending, approved, transferred, rejected
            $table->string('transfer_receipt_url')->nullable();
            $table->text('admin_notes')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('processed_at')->nullable();
            $table->timestamps();
        });

        // 6. Player Aggregate Stats Table (Untuk Grafik Radar & Kurva Performa)
        Schema::create('player_stats', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->integer('year')->default(2026);
            $table->integer('month')->default(1);
            $table->integer('matches_played')->default(0);
            $table->integer('matches_won')->default(0);
            $table->integer('matches_lost')->default(0);
            $table->integer('tournaments_joined')->default(0);
            $table->integer('championships_won')->default(0);
            $table->decimal('win_rate', 5, 2)->default(0);
            $table->integer('games_won')->default(0);
            $table->integer('games_lost')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'year', 'month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_stats');
        Schema::dropIfExists('payout_requests');
        Schema::dropIfExists('blog_posts');
        Schema::dropIfExists('blog_categories');
        Schema::dropIfExists('whatsapp_logs');
        Schema::dropIfExists('whatsapp_configs');
    }
};
