<?php

namespace App\Http\Requests\MachineModel;

use App\Http\Responses\ApiResponse;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateMachineModelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('machine_model.edit') ?? true;
    }

    public function rules(): array
    {
        $model = $this->route('machine_model');
        $modelId = is_object($model) ? $model->id : $model;

        return [
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('machine_models', 'code')->ignore($modelId),
            ],
            'name' => [
                'sometimes',
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
