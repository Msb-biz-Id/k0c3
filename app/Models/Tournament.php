<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tournament extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'sport_type',
        'description',
        'venue_name',
        'venue_address',
        'city_id',
        'city_name',
        'province_id',
        'province_name',
        'google_maps_url',
        'start_date',
        'end_date',
        'registration_deadline',
        'registration_guide',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'registration_deadline' => 'datetime',
    ];

    public function organizer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function images()
    {
        return $this->hasMany(TournamentImage::class, 'tournament_id')->orderBy('sort_order');
    }

    public function featuredImage()
    {
        return $this->hasOne(TournamentImage::class, 'tournament_id')->where('is_featured', true);
    }

    public function categories()
    {
        return $this->hasMany(TournamentCategory::class, 'tournament_id');
    }

    public function courts()
    {
        return $this->hasMany(Court::class, 'tournament_id');
    }

    public function payoutRequests()
    {
        return $this->hasMany(PayoutRequest::class, 'tournament_id');
    }

    public function matches()
    {
        return $this->hasManyThrough(TournamentMatch::class, TournamentCategory::class, 'tournament_id', 'category_id');
    }

    public function teams()
    {
        return $this->hasManyThrough(Team::class, TournamentCategory::class, 'tournament_id', 'category_id');
    }
}
