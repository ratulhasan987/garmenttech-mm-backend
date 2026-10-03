<?php

namespace App\Http\Requests\MachineModel;

use App\Http\Responses\ApiResponse;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreMachineModelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('machine_model.create') ?? true;
    }

    public function rules(): array
    {
        return [
            'code' => [
                'required',
                'string',
                'max:255',
                'unique:machine_models,code',
            ],
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'machine_category_id' => [
                'nullable',
                'integer',
                'exists:machine_categories,id',
            ],
            'brand_id' => [
                'nullable',
                'integer',
                'exists:brands,id',
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
            'code.unique' => 'A machine model with this code already exists.',
            'machine_category_id.exists' => 'The selected machine category does not exist.',
            'brand_id.exists' => 'The selected brand does not exist.',
        ];
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            ApiResponse::error(
                message: 'You do not have permission to create a machine model.',
                status: 403
            )
        );
    }
}
