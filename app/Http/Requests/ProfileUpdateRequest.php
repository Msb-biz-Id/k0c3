<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'phone' => ['nullable', 'string', 'max:30'],
            'gender' => ['nullable', 'in:male,female'],
            'skill_level' => ['nullable', 'string', 'max:100'],
            'preferred_side' => ['nullable', 'in:left,right,both'],
            'dominant_hand' => ['nullable', 'in:right,left,ambidextrous'],
            'playtomic_rating' => ['nullable', 'numeric', 'between:0,7.0'],
            'city_name' => ['nullable', 'string', 'max:100'],
            'city_id' => ['nullable', 'string', 'max:10'],
            'avatar' => ['nullable', 'string', 'max:500'],
            'bio' => ['nullable', 'string', 'max:500'],
        ];
    }
}
