<?php

namespace App\Http\Requests\Machine;

use App\Http\Responses\ApiResponse;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class UpdateMachineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('machine.edit') ?? false;
    }

    public function rules(): array
    {
        $machine = $this->route('machine');
        $machineId = is_object($machine) ? $machine->id : $machine;

        return [
            'model_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:machine_models,id',
            ],
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('machines', 'code')->ignore($machineId),
            ],
            'notes' => [
                'nullable',
                'string',
            ],
            'status' => [
                'sometimes',
                'required',
                'string',
                Rule::in(['active', 'inactive', 'maintenance', 'retired']),
            ],

            // Optional: move machine to a new location
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
            'model_id.exists' => 'The selected machine model does not exist.',
            'code.unique' => 'This machine code already exists.',
            'status.in' => 'Invalid status. Allowed: active, inactive, maintenance, retired.',
            'location.floor_id.required_with' => 'Floor is required when moving the machine.',
            'location.floor_id.exists' => 'The selected floor does not exist.',
            'location.sl_no.required_with' => 'Serial number (sl_no) is required when moving the machine.',
        ];
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(
            ApiResponse::error(
                message: 'You do not have permission to update this machine.',
                status: 403
            )
        );
    }
}
