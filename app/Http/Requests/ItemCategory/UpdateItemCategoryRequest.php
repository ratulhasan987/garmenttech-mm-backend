<?php

namespace App\Http\Requests\ItemCategory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateItemCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        // TEMPORARILY SET TO true: Bypass permission check
        return true; 
    }

    public function rules(): array
    {
        $itemCategory = $this->route('item_category');
        $id = is_object($itemCategory) ? $itemCategory->id : $itemCategory;

        return [
            'parent_id' => ['nullable', 'exists:item_categories,id'],
            'item_type_id' => ['nullable', 'exists:item_types,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('item_categories', 'name')->ignore($id)],
            'code' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}