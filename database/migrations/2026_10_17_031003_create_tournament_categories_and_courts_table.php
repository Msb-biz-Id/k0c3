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
        // 1. Tournament Categories
        Schema::create('tournament_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tournament_id')->constrained('tournaments')->cascadeOnDelete();
            $table->string('name'); // e.g. Men Beginner, Open Gold
            
            // Relasi Dinamis Master Data + Snapshot Protection (Data Historis Tetap Utuh)
            $table->foreignUuid('tier_id')->nullable()->constrained('master_tiers')->nullOnDelete();
            $table->string('tier_name', 100)->nullable();
            
            $table->foreignUuid('division_id')->nullable()->constrained('master_divisions')->nullOnDelete();
            $table->string('division_name', 100)->nullable();
            
            $table->foreignUuid('skill_level_id')->nullable()->constrained('master_skill_levels')->nullOnDelete();
            $table->string('skill_level_name', 100)->nullable();
            
            $table->integer('max_teams')->default(12);
            $table->decimal('registration_fee', 14, 2)->default(0);
            $table->string('format', 30)->default('group_knockout'); // group_knockout, knockout_only, round_robin
            $table->integer('group_count')->default(2);
            $table->integer('advancing_per_group')->default(2);
            $table->boolean('has_wildcard')->default(false); // Best loser
            $table->boolean('has_third_place')->default(true); // Perebutan juara 3
            $table->string('knockout_method', 30)->default('cross_group'); // cross_group, seeded_draw
            $table->json('match_rules')->nullable(); // Race to 3/4/6/8/9, Deuce Golden Point/Advantage, Super Tie Break per babak
            $table->boolean('is_open_registration')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });

        // 2. Courts Table
        Schema::create('courts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tournament_id')->constrained('tournaments')->cascadeOnDelete();
            $table->string('name', 100); // e.g. Lapangan 1, Court Barat
            $table->string('surface_type', 50)->default('panoramic_turf');
            $table->string('referee_token', 64)->unique(); // Token akses wasit tanpa login
            $table->string('referee_pin', 10)->default('1234');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courts');
        Schema::dropIfExists('tournament_categories');
    }
};
