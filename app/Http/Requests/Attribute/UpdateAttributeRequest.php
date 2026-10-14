<?php

namespace App\Http\Requests\Attribute;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAttributeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $id = $this->route('attribute')->id ?? $this->route('attribute');
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('attributes', 'name')->ignore($id)],
            'type' => ['sometimes', 'required', 'in:text,number,boolean,select'],
            'options' => ['nullable', 'array'],
            'options.*' => ['string', 'max:255'],
        ];
    }
}