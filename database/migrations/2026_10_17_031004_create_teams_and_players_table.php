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
        // 1. Teams Table
        Schema::create('teams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')->constrained('tournament_categories')->cascadeOnDelete();
            $table->string('name'); // e.g. Budi & Andi
            $table->string('group_letter', 10)->nullable(); // A, B, C, D
            $table->integer('group_draw_seed')->nullable(); // Seeded 1, 2, dll
            $table->string('payment_status', 30)->default('pending'); // pending, verified, rejected
            $table->decimal('payment_amount', 14, 2)->default(0);
            $table->string('payment_receipt_url')->nullable();
            $table->dateTime('payment_verified_at')->nullable();
            $table->boolean('is_checked_in')->default(false);
            $table->dateTime('checked_in_at')->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        // 2. Team Players Table
        Schema::create('team_players', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('team_id')->constrained('teams')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // Jika sudah punya akun
            $table->tinyInteger('player_order')->default(1); // 1 = Kapten, 2 = Partner
            $table->string('name');
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->string('nik', 50)->nullable();
            $table->string('jersey_size', 10)->nullable(); // S, M, L, XL, XXL
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone', 30)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_players');
        Schema::dropIfExists('teams');
    }
};
