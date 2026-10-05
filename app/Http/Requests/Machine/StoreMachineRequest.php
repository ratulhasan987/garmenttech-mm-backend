<?php

namespace App\Http\Requests\Machine;

use App\Http\Responses\ApiResponse;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreMachineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('machine.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'model_id' => [
                'required',
                'integer',
                'exists:machine_models,id',
            ],
            'code' => [
                'required',
                'string',
                'max:100',
                'unique:machines,code',
            ],
            'notes' => [
                'nullable',
                'string',
            ],
            'status' => [
                'required',
                'string',
                Rule::in(['active', 'inactive', 'maintenance', 'retired']),
            ],

            // Optional location on create
            'location' => [
                'nullable',
                'array',
            ],
            'location.floor_id' => [
                'required_with:location',
                'integer',
                'exists:floors,id',
            ],
            'location.sl_no' => [
                'required_with:location',
                'string',
                'max:50',
            ],
            'location.assigned_at' => [
                'nullable',
                'date',
            ],
            'location.remarks' => [
                'nullable',
                'string',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'model_id.required' => 'Please select a machine model.',
            'model_id.exists' => 'The selected machine model does not exist.',
            'code.required' => 'Machine code is required.',
            'code.unique' => 'This machine code already exists.',
            'status.in' => 'Invalid status. Allowed: active, inactive, maintenance, retired.',
            'location.floor_id.required_with' => 'Floor is required when assigning a location.',
            'location.floor_id.exists' => 'The selected floor does not exist.',
            'location.sl_no.required_with' => 'Serial number (sl_no) is required when assigning a location.',
        ];
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            ApiResponse::error(
                message: 'You do not have permission to create a machine.',
                status: 403
            )
        );
    }
}
