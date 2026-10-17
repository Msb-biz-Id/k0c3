<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TournamentMatch extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'matches';

    protected $fillable = [
        'category_id',
        'court_id',
        'stage',
        'round_name',
        'round_order',
        'group_letter',
        'match_number',
        'team1_id',
        'team2_id',
        'winner_team_id',
        'next_match_id',
        'loser_next_match_id',
        'scheduled_time',
        'started_at',
        'completed_at',
        'status',
        'team1_set1_score',
        'team2_set1_score',
        'team1_set2_score',
        'team2_set2_score',
        'team1_set3_score',
        'team2_set3_score',
        'tiebreak_scores',
        'current_game_score',
        'server_team',
    ];

    protected $casts = [
        'scheduled_time' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'tiebreak_scores' => 'array',
        'round_order' => 'integer',
        'match_number' => 'integer',
        'team1_set1_score' => 'integer',
        'team2_set1_score' => 'integer',
        'team1_set2_score' => 'integer',
        'team2_set2_score' => 'integer',
        'team1_set3_score' => 'integer',
        'team2_set3_score' => 'integer',
        'server_team' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(TournamentCategory::class, 'category_id');
    }

    public function court()
    {
        return $this->belongsTo(Court::class, 'court_id');
    }

    public function team1()
    {
        return $this->belongsTo(Team::class, 'team1_id');
    }

    public function team2()
    {
        return $this->belongsTo(Team::class, 'team2_id');
    }

    public function winnerTeam()
    {
        return $this->belongsTo(Team::class, 'winner_team_id');
    }

    public function nextMatch()
    {
        return $this->belongsTo(TournamentMatch::class, 'next_match_id');
    }

    public function loserNextMatch()
    {
        return $this->belongsTo(TournamentMatch::class, 'loser_next_match_id');
    }

    public function scoreLogs()
    {
        return $this->hasMany(ScoreLog::class, 'match_id')->latest();
    }
}
