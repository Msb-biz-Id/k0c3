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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 30)->nullable()->after('email');
            $table->string('avatar', 255)->nullable()->after('phone');
            $table->string('gender', 20)->nullable()->after('avatar'); // male, female
            $table->string('skill_level', 100)->nullable()->after('gender');
            $table->string('preferred_side', 20)->nullable()->after('skill_level'); // left, right, both
            $table->string('dominant_hand', 20)->nullable()->after('preferred_side'); // right, left, ambidextrous
            $table->decimal('playtomic_rating', 4, 2)->nullable()->after('dominant_hand');
            $table->string('city_id', 10)->nullable()->after('playtomic_rating');
            $table->string('city_name', 100)->nullable()->after('city_id');
            $table->text('bio')->nullable()->after('city_name');
            $table->boolean('is_active')->default(true)->after('bio');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'avatar',
                'gender',
                'skill_level',
                'preferred_side',
                'dominant_hand',
                'playtomic_rating',
                'city_id',
                'city_name',
                'bio',
                'is_active',
            ]);
        });
    }
};
