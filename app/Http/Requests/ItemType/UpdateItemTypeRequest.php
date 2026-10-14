<?php

namespace App\Http\Requests\ItemType;

use App\Http\Responses\ApiResponse;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateItemTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        // TEMPORARILY SET TO true: Bypass permission check
        return true; 
        // return $this->user()?->can('item.type.edit') ?? false;
    }

    public function rules(): array
    {
        $itemType = $this->route('item_type');
        $itemTypeId = is_object($itemType) ? $itemType->id : $itemType;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('item_types', 'name')->ignore($itemTypeId)],
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
                message: 'You do not have permission to update an item type.',
                status: 403
            )
        );
    }
}