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
        // 1. Matches Table
        Schema::create('matches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')->constrained('tournament_categories')->cascadeOnDelete();
            $table->foreignUuid('court_id')->nullable()->constrained('courts')->nullOnDelete();
            
            $table->string('stage', 30)->default('group'); // group, knockout
            $table->string('round_name', 50)->default('Group Stage'); // Group Stage, Round of 16, Quarter Final, Semi Final, Bronze Match, Final
            $table->integer('round_order')->default(1);
            $table->string('group_letter', 10)->nullable(); // A, B, C...
            $table->integer('match_number')->default(1);
            
            // Relasi Tim
            $table->foreignUuid('team1_id')->nullable()->constrained('teams')->nullOnDelete();
            $table->foreignUuid('team2_id')->nullable()->constrained('teams')->nullOnDelete();
            $table->foreignUuid('winner_team_id')->nullable()->constrained('teams')->nullOnDelete();
            
            // Relasi Pohon Bracket (Binary Tree Next Match Pointer)
            $table->uuid('next_match_id')->nullable();
            $table->uuid('loser_next_match_id')->nullable(); // Untuk perebutan juara 3
            
            $table->dateTime('scheduled_time')->nullable();
            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->string('status', 30)->default('pending'); // pending, warm_up, on_court, completed, walkover
            
            // Skor Pertandingan
            $table->integer('team1_set1_score')->default(0);
            $table->integer('team2_set1_score')->default(0);
            $table->integer('team1_set2_score')->default(0);
            $table->integer('team2_set2_score')->default(0);
            $table->integer('team1_set3_score')->default(0);
            $table->integer('team2_set3_score')->default(0);
            $table->json('tiebreak_scores')->nullable();
            
            // Live Point Telemetry (Untuk TV Slideshow & Live Score)
            $table->string('current_game_score', 20)->default('0 - 0'); // e.g. "40 - 30", "DEUCE (Golden Point)"
            $table->tinyInteger('server_team')->default(1); // 1 or 2
            
            $table->timestamps();

            // Self-referencing foreign keys for bracket tree
            $table->foreign('next_match_id')->references('id')->on('matches')->nullOnDelete();
            $table->foreign('loser_next_match_id')->references('id')->on('matches')->nullOnDelete();
        });

        // 2. Score Logs Table (Audit trail perubahan skor wasit/panitia)
        Schema::create('score_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('match_id')->constrained('matches')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // Wasit atau Admin
            $table->string('court_name', 100)->nullable();
            $table->string('previous_score', 100);
            $table->string('new_score', 100);
            $table->string('action_type', 50)->default('point_update'); // point_update, set_finish, match_finish, undo
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('score_logs');
        Schema::dropIfExists('matches');
    }
};
