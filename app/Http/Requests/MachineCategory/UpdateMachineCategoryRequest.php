<?php

namespace App\Http\Requests\MachineCategory;

use App\Http\Responses\ApiResponse;
use App\Models\MachineCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateMachineCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('machine_category.edit') ?? true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // React sends "" when "None (Root Category)" is selected.
        // Convert it to null so it doesn't fail the 'integer' validation rule.
        $this->merge([
            'parent_id' => $this->parent_id === '' ? null : $this->parent_id,
        ]);
    }

    public function rules(): array
    {
        // Robustly fetch the ID to handle various route parameter names ({id}, {machine_category}, etc.)
        $category = $this->route('machine_category') 
            ?? $this->route('machineCategory') 
            ?? $this->route('id');
            
        $categoryId = $category instanceof MachineCategory 
            ? $category->id 
            : $category;

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('machine_categories', 'name')->ignore($categoryId),
            ],
            'parent_id' => [
                'nullable',
                'integer',
                'exists:machine_categories,id',
                // Use a closure to reliably prevent self-parenting
                function ($attribute, $value, $fail) use ($categoryId) {
                    if ($value !== null && (int) $value === (int) $categoryId) {
                        $fail('A category cannot be its own parent.');
                    }
                },
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
            'name.unique' => 'A machine category with this name already exists.',
            'parent_id.exists' => 'The selected parent category does not exist.',
        ];
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            ApiResponse::error(
                // Fixed typo: changed 'create' to 'update'
                message: 'You do not have permission to update a machine category.',
                status: 403
            )
        );
    }
}