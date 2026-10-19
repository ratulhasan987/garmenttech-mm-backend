<?php

namespace App\Http\Requests\ItemCategory;

use Illuminate\Foundation\Http\FormRequest;

class StoreItemCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        // TEMPORARILY SET TO true: Bypass permission check
        return true; 
    }

    public function rules(): array
    {
        return [
            'parent_id' => ['nullable', 'exists:item_categories,id'],
            'item_type_id' => ['nullable', 'exists:item_types,id'],
            'name' => ['required', 'string', 'max:255', 'unique:item_categories,name'],
            'code' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}