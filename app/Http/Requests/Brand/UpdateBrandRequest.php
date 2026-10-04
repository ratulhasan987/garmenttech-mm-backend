<?php

namespace App\Http\Requests\Brand;

use App\Http\Responses\ApiResponse;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('brand.edit') ?? false;
    }

    public function rules(): array
    {
        $brand = $this->route('brand');
        $brandId = is_object($brand) ? $brand->id : $brand;

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('buildings', 'name')->ignore($brandId),
            ],
            'country' => [
                'nullable',
                'string',
            ],
            'website' => [
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
            'name.unique' => 'A brand with this name already exists.',
        ];
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            ApiResponse::error(
                message: 'You do not have permission to create a brand.',
                status: 403
            )
        );
    }
}
