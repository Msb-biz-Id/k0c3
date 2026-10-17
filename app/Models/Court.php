<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Court extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tournament_id',
        'name',
        'surface_type',
        'referee_token',
        'referee_pin',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function ($court) {
            if (empty($court->referee_token)) {
                $court->referee_token = strtoupper(Str::random(4) . '-' . Str::random(4));
            }
            if (empty($court->referee_pin)) {
                $court->referee_pin = (string) rand(1000, 9999);
            }
        });
    }

    public function tournament()
    {
        return $this->belongsTo(Tournament::class, 'tournament_id');
    }

    public function matches()
    {
        return $this->hasMany(TournamentMatch::class, 'court_id');
    }
}
