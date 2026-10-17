<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TournamentCategory extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'tournament_id',
        'name',
        'tier_id',
        'tier_name',
        'division_id',
        'division_name',
        'skill_level_id',
        'skill_level_name',
        'max_teams',
        'registration_fee',
        'format',
        'group_count',
        'advancing_per_group',
        'has_wildcard',
        'has_third_place',
        'knockout_method',
        'match_rules',
        'is_open_registration',
    ];

    protected $casts = [
        'registration_fee' => 'decimal:2',
        'max_teams' => 'integer',
        'group_count' => 'integer',
        'advancing_per_group' => 'integer',
        'has_wildcard' => 'boolean',
        'has_third_place' => 'boolean',
        'is_open_registration' => 'boolean',
        'match_rules' => 'array',
    ];

    public function tournament()
    {
        return $this->belongsTo(Tournament::class, 'tournament_id');
    }

    public function tier()
    {
        return $this->belongsTo(MasterTier::class, 'tier_id');
    }

    public function division()
    {
        return $this->belongsTo(MasterDivision::class, 'division_id');
    }

    public function skillLevel()
    {
        return $this->belongsTo(MasterSkillLevel::class, 'skill_level_id');
    }

    public function teams()
    {
        return $this->hasMany(Team::class, 'category_id');
    }

    public function matches()
    {
        return $this->hasMany(TournamentMatch::class, 'category_id');
    }
}
