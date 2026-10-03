<?php

namespace App\Http\Requests\Floor;

use App\Http\Responses\ApiResponse;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreFloorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('floor.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'building_id' => [
                'required',
                'integer',
                'exists:buildings,id',
            ],
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'floor_number' => [
                'required',
                'integer',
                Rule::unique('floors', 'floor_number')
                    ->where('building_id', $this->input('building_id')),
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'is_active' => [
                'nullable',
                'boolean',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'building_id.required' => 'Please select a building.',
            'building_id.exists' => 'The selected building does not exist.',
            'floor_number.unique' => 'A floor with this number already exists in the selected building.',
        ];
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            ApiResponse::error(
                message: 'You do not have permission to create a floor.',
                status: 403
            )
        );
    }
}
