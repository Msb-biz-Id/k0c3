<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TournamentResource extends JsonResource
{
    /**
     * Transform the resource into an array for Inertia props.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sport_type' => $this->sport_type,
            'description' => $this->description,
            'venue_name' => $this->venue_name,
            'venue_address' => $this->venue_address,
            'city_name' => $this->city_name,
            'province_name' => $this->province_name,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),
            'status' => $this->status,
            'featured_image' => $this->whenLoaded('featuredImage', fn () => [
                'image_path' => $this->featuredImage?->image_path,
            ]),
            'categories_count' => $this->whenCounted('categories'),
            'courts_count' => $this->whenCounted('courts'),
        ];
    }
}
