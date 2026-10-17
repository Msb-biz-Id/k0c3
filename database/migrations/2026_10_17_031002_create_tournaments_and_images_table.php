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
        // 1. Tournaments Table
        Schema::create('tournaments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Organizer
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sport_type', 50)->default('padel'); // padel, tennis
            $table->text('description')->nullable();
            $table->string('venue_name');
            $table->text('venue_address')->nullable();
            $table->string('city_id', 10)->nullable();
            $table->string('city_name', 100)->nullable();
            $table->string('province_id', 10)->nullable();
            $table->string('province_name', 100)->nullable();
            $table->string('google_maps_url')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->dateTime('registration_deadline')->nullable();
            $table->longText('registration_guide')->nullable(); // HTML sanitized TipTap content
            $table->string('bank_name', 100)->nullable();
            $table->string('bank_account_number', 100)->nullable();
            $table->string('bank_account_holder', 255)->nullable();
            $table->string('status', 30)->default('draft'); // draft, published, ongoing, completed, cancelled
            $table->softDeletes();
            $table->timestamps();
        });

        // 2. Tournament Images Table (Multi-image gallery with featured flag)
        Schema::create('tournament_images', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tournament_id')->constrained('tournaments')->cascadeOnDelete();
            $table->string('image_path');
            $table->string('caption')->nullable();
            $table->boolean('is_featured')->default(false); // Poster utama
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tournament_images');
        Schema::dropIfExists('tournaments');
    }
};
