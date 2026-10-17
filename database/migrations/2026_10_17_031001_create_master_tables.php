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
        // 1. Master Tiers (Mini, Grand, Open, Community, dll)
        Schema::create('master_tiers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->string('badge_color', 50)->default('#a3e635'); // Hex color for UI badge
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });

        // 2. Master Divisions (Men, Women, Mixed, Open, dll)
        Schema::create('master_divisions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->string('gender_restriction', 30)->nullable(); // male, female, mixed, any
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });

        // 3. Master Skill Levels (Newbie, Rookie, Beginner, Upper Beginner, Intermediate, Lower Bronze, dll)
        Schema::create('master_skill_levels', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->decimal('min_rating', 4, 2)->nullable();
            $table->decimal('max_rating', 4, 2)->nullable();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_skill_levels');
        Schema::dropIfExists('master_divisions');
        Schema::dropIfExists('master_tiers');
    }
};
