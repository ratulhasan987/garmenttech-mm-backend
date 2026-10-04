<?php

namespace App\Http\Requests\MachineCategory;

use App\Http\Responses\ApiResponse;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateMachineCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('machine_category.edit') ?? true;
    }

    public function rules(): array
    {
        // Get category ID from route parameter (e.g. /api/machine-categories/{machine_category})
        $category = $this->route('machine_category');
        $categoryId = is_object($category) ? $category->id : $category;

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
                Rule::notIn([$categoryId]), // Prevents setting parent_id to itself
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
            'parent_id.not_in' => 'A category cannot be its own parent.',
        ];
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            ApiResponse::error(
                message: 'You do not have permission to create a machine category.',
                status: 403
            )
        );
    }
}
