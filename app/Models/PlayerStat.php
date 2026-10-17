<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlayerStat extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'year',
        'month',
        'matches_played',
        'matches_won',
        'matches_lost',
        'tournaments_joined',
        'championships_won',
        'win_rate',
        'games_won',
        'games_lost',
    ];

    protected $casts = [
        'year' => 'integer',
        'month' => 'integer',
        'matches_played' => 'integer',
        'matches_won' => 'integer',
        'matches_lost' => 'integer',
        'tournaments_joined' => 'integer',
        'championships_won' => 'integer',
        'win_rate' => 'decimal:2',
        'games_won' => 'integer',
        'games_lost' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
