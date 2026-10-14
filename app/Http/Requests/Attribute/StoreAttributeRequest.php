<?php

namespace App\Http\Requests\Attribute;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttributeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'unique:attributes,name'],
            'type' => ['required', 'in:text,number,boolean,select'],
            'options' => ['nullable', 'array'],
            'options.*' => ['string', 'max:255'],
        ];
    }
}