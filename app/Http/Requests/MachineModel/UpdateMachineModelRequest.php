<?php

namespace App\Http\Requests\MachineModel;

use App\Http\Responses\ApiResponse;
use App\Models\MachineModel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateMachineModelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('machine_model.edit') ?? true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // React sends "" when "None" is selected in dropdowns.
        // Convert empty strings to null so they don't fail the 'integer' validation rule.
        $this->merge([
            'machine_category_id' => $this->machine_category_id === '' ? null : $this->machine_category_id,
            'brand_id'            => $this->brand_id === '' ? null : $this->brand_id,
        ]);
    }

    public function rules(): array
    {
        // Robustly fetch the ID to handle various route parameter names ({id}, {machine_model}, etc.)
        $model = $this->route('machine_model') 
            ?? $this->route('machineModel') 
            ?? $this->route('id');
            
        $modelId = $model instanceof MachineModel 
            ? $model->id 
            : $model;

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
                // Fixed typo: changed 'create' to 'update'
                message: 'You do not have permission to update a machine model.',
                status: 403
            )
        );
    }
}