<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('user.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'department' => [
                'required',
                'exists:departments,id',
            ],

            'designation' => [
                'required',
                'exists:designations,id',
            ],

            'reporting_officer' => [
                'nullable',
                'exists:users,id',
            ],

            'shift' => [
                'required',
                'exists:shifts,id',
            ],

            'phone' => [
                'required',
                'string',
                'max:255',
            ],

            'mobile' => [
                'nullable',
                'string',
                'max:255',
            ],

            'national_id' => [
                'nullable',
                'string',
                'max:255',
            ],

            'emergency_contact' => [
                'required',
                'string',
                'max:255',
            ],

            'pay_frequency' => [
                'required',
                'string',
                'max:255',
            ],

            'bank_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'account_number' => [
                'nullable',
                'string',
                'max:255',
            ],

            'branch_address' => [
                'nullable',
                'string',
                'max:255',
            ],

            'tin_number' => [
                'nullable',
                'string',
                'max:255',
            ],

            'joining_date' => [
                'required',
                'date',
            ],

            'probation_period_end_date' => [
                'required',
                'date',
            ],

            'basic_salary' => [
                'required',
                'numeric',
                'min:0',
            ],

            'transport_allowance' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'family_allowance' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'others_allowance' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'gender' => [
                'nullable',
                'string',
                'max:255',
            ],

            'marital_status' => [
                'nullable',
                'string',
                'max:255',
            ],

            'blood_group' => [
                'nullable',
                'string',
                'max:255',
            ],

            'health_condition' => [
                'nullable',
                'string',
                'max:255',
            ],

            'role' => [
                'required',
                'string',
                'exists:roles,name',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
            ],

            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg,gif',
                'max:2048',
            ],

            'address' => [
                'nullable',
                'string',
                'max:255',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'department.exists' => 'Selected department does not exist.',
            'designation.exists' => 'Selected designation does not exist.',
            'shift.exists' => 'Selected shift does not exist.',
            'role.exists' => 'Selected role does not exist.',
        ];
    }
}
