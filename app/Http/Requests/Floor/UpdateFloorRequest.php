<?php

namespace App\Http\Requests\Floor;

use App\Http\Responses\ApiResponse;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateFloorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('floor.edit') ?? false;
    }

    public function rules(): array
    {
        $floor = $this->route('floor');
        $floorId = is_object($floor) ? $floor->id : $floor;

        $buildingId = $this->input('building_id')
            ?? (is_object($floor) ? $floor->building_id : null);

        return [
            'building_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:buildings,id',
            ],
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],
            'floor_number' => [
                'sometimes',
                'required',
                'integer',
                Rule::unique('floors', 'floor_number')
                    ->where('building_id', $buildingId)
                    ->ignore($floorId),
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'is_active' => [
                'nullable',
                'boolean',
            ],

            'line_amount' => ['required', 'integer', 'min:1'],
            'max_machine_per_line' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'building_id.exists' => 'The selected building does not exist.',
            'floor_number.unique' => 'A floor with this number already exists in the selected building.',
        ];
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            ApiResponse::error(
                message: 'You do not have permission to update this floor.',
                status: 403
            )
        );
    }
}
