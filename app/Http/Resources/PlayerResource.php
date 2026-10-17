<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlayerResource extends JsonResource
{
    /**
     * Transform the athlete resource into an array for Inertia props.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'gender' => $this->gender,
            'skill_level' => $this->skill_level,
            'preferred_side' => $this->preferred_side,
            'dominant_hand' => $this->dominant_hand,
            'playtomic_rating' => $this->playtomic_rating,
            'city_name' => $this->city_name,
            'bio' => $this->bio,
            'is_active' => (bool) $this->is_active,
        ];
    }
}
