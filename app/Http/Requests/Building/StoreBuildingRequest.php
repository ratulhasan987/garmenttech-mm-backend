<?php

namespace App\Http\Requests\Building;

use App\Http\Responses\ApiResponse;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreBuildingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('building.create') ?? true;
    }

    public function rules(): array
    {
        return [
            'code' => [
                'required',
                'string',
                'max:255',
                'unique:buildings,code',
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:buildings,name',
            ],
            'address' => [
                'nullable',
                'string',
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
            'code.unique' => 'A building with this code already exists.',
            'name.unique' => 'A building with this name already exists.',
        ];
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            ApiResponse::error(
                message: 'You do not have permission to create a building.',
                status: 403
            )
        );
    }
}
