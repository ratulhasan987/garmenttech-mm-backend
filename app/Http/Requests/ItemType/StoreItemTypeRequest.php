<?php

namespace App\Http\Requests\ItemType;

use App\Http\Responses\ApiResponse;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreItemTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        // TEMPORARILY SET TO true: Bypass permission check
        return true; 
        // return $this->user()?->can('item.type.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:item_types,name'],
            'code' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_consumable' => ['nullable', 'boolean'],
            'is_serialized' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'An item type with this name already exists.',
        ];
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            ApiResponse::error(
                message: 'You do not have permission to create an item type.',
                status: 403
            )
        );
    }
}