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
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')->default('Koceevent');
            $table->string('tagline')->nullable()->default('Sports & Tournament Management Platform');
            $table->text('about_text')->nullable();
            $table->string('logo_light_path')->nullable();
            $table->string('logo_dark_path')->nullable();
            $table->string('favicon_path')->nullable();
            $table->string('email')->nullable()->default('support@koceevent.com');
            $table->string('phone')->nullable()->default('+62 812-3456-7890');
            $table->string('whatsapp_number')->nullable()->default('6281234567890');
            $table->text('address')->nullable()->default('Gelora Sports Complex, Jakarta');
            $table->text('google_maps_embed')->nullable();
            $table->json('social_links')->nullable();
            $table->json('seo_meta')->nullable();
            $table->json('landing_sections')->nullable();
            $table->timestamps();
        });

        Schema::create('hero_slides', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('badge_text')->nullable();
            $table->string('title');
            $table->text('subtitle')->nullable();
            $table->string('image_path')->nullable();
            $table->string('cta_text')->nullable();
            $table->string('cta_link')->nullable();
            $table->string('secondary_cta_text')->nullable();
            $table->string('secondary_cta_link')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('partner_slides', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('logo_path')->nullable();
            $table->string('tier')->default('official_partner');
            $table->string('website_url')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partner_slides');
        Schema::dropIfExists('hero_slides');
        Schema::dropIfExists('company_settings');
    }
};
