<?php

namespace App\Http\Requests\Organizer;

use Illuminate\Foundation\Http\FormRequest;

class StoreTournamentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->hasRole('organizer') || $user->hasRole('superadmin'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Basic Info
            'name' => ['required', 'string', 'max:255'],
            'sport_type' => ['required', 'string', 'in:padel,tennis'],
            'description' => ['nullable', 'string', 'max:2000'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'registration_deadline' => ['nullable', 'date', 'before_or_equal:end_date'],
            'registration_guide' => ['nullable', 'string'],

            // Venue & Location
            'venue_name' => ['required', 'string', 'max:255'],
            'venue_address' => ['nullable', 'string', 'max:500'],
            'province_id' => ['nullable', 'string', 'max:10'],
            'province_name' => ['nullable', 'string', 'max:100'],
            'city_id' => ['nullable', 'string', 'max:10'],
            'city_name' => ['nullable', 'string', 'max:100'],
            'google_maps_url' => ['nullable', 'url', 'max:500'],

            // Bank Account for Withdrawals
            'bank_name' => ['required', 'string', 'max:100'],
            'bank_account_number' => ['required', 'string', 'max:50'],
            'bank_account_holder' => ['required', 'string', 'max:255'],

            // Categories Array
            'categories' => ['required', 'array', 'min:1'],
            'categories.*.name' => ['required', 'string', 'max:100'],
            'categories.*.tier_id' => ['nullable', 'uuid', 'exists:master_tiers,id'],
            'categories.*.division_id' => ['nullable', 'uuid', 'exists:master_divisions,id'],
            'categories.*.skill_level_id' => ['nullable', 'uuid', 'exists:master_skill_levels,id'],
            'categories.*.max_teams' => ['required', 'integer', 'min:2', 'max:64'],
            'categories.*.registration_fee' => ['required', 'numeric', 'min:0'],
            'categories.*.format' => ['required', 'string', 'in:group_knockout,knockout_only,round_robin'],
            'categories.*.is_open_registration' => ['nullable', 'boolean'],

            // Courts Array
            'courts' => ['nullable', 'array'],
            'courts.*.name' => ['required_with:courts', 'string', 'max:100'],
            'courts.*.surface_type' => ['nullable', 'string', 'max:50'],

            // Multi-image uploads (Optional on creation, max 10 files)
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'], // Max 5MB per image
            'featured_image_index' => ['nullable', 'integer', 'min:0', 'max:9'],
        ];
    }
}
