<?php

namespace App\Http\Requests\Item;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // TEMPORARILY SET TO true
    }

    public function rules(): array
    {
        $item = $this->route('item');
        $id = is_object($item) ? $item->id : $item;

        return [
            'item_type_id' => ['sometimes', 'required', 'exists:item_types,id'],
            'item_category_id' => ['nullable', 'exists:item_categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'item_code' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('items', 'item_code')->ignore($id)],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'part_number' => ['nullable', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:255'],
            'barcode' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'minimum_stock' => ['nullable', 'integer', 'min:0'],
            'reorder_stock' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'boolean'],
        ];
    }
}