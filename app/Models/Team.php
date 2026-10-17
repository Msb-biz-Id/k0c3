<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Team extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'category_id',
        'name',
        'group_letter',
        'group_draw_seed',
        'payment_status',
        'payment_amount',
        'payment_receipt_url',
        'payment_verified_at',
        'is_checked_in',
        'checked_in_at',
        'notes',
    ];

    protected $casts = [
        'payment_amount' => 'decimal:2',
        'payment_verified_at' => 'datetime',
        'is_checked_in' => 'boolean',
        'checked_in_at' => 'datetime',
        'group_draw_seed' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(TournamentCategory::class, 'category_id');
    }

    public function players()
    {
        return $this->hasMany(TeamPlayer::class, 'team_id')->orderBy('player_order');
    }

    public function teamPlayers()
    {
        return $this->players();
    }

    public function captain()
    {
        return $this->hasOne(TeamPlayer::class, 'team_id')->where('player_order', 1);
    }

    public function partner()
    {
        return $this->hasOne(TeamPlayer::class, 'team_id')->where('player_order', 2);
    }

    public function homeMatches()
    {
        return $this->hasMany(TournamentMatch::class, 'team1_id');
    }

    public function awayMatches()
    {
        return $this->hasMany(TournamentMatch::class, 'team2_id');
    }
}
