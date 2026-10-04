<?php

namespace App\Http\Requests\MachineCategory;

use App\Http\Responses\ApiResponse;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreMachineCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('machine_category.create') ?? true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:machine_categories,name',
            ],
            'parent_id' => [
                'nullable',
                'integer',
                'exists:machine_categories,id',
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
                message: 'You do not have permission to create a machine category.',
                status: 403
            )
        );
    }
}
