<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class UserService
{
    public function employees(?string $keyword = null): Collection
    {
        return User::query()
            ->select([
                'id',
                'employee_id',
                'name',
            ])
            ->when(
                filled($keyword),
                function ($query) use ($keyword) {
                    $query->where(function ($query) use ($keyword) {
                        $query
                            ->where('name', 'like', "%{$keyword}%")
                            ->orWhere(
                                'employee_id',
                                'like',
                                "%{$keyword}%"
                            );
                    });
                }
            )
            ->orderBy('name')
            ->limit(20)
            ->get();
    }

    public function userData(User $user): array
    {
        $user->loadMissing([
            'roles',
            'shift',
        ]);

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'account' => $user->account,
                'image' => $user->image,
                'status' => $user->status,

                'attendanceType' => $user->attendance_type,
                'useFingerprint' => $user->use_fingerprint,
                'useFace' => $user->use_face,

                'shift' => $user->shift,
                'workingHours' => $user->working_hours,

                'phone' => $user->phone,
                'language' => $user->language,

                'website' => $user->website,
                'github' => $user->github,
                'twitter' => $user->twitter,
                'facebook' => $user->facebook,
                'linkedIn' => $user->linkedIn,

                'joiningDate' => $user->joining_date,
                'probationPeriodEndDate' => $user->probation_period_end_date,

                'emergencyContact' => $user->emergency_contact,
                'nationalId' => $user->national_id,

                'payFrequency' => $user->pay_frequency,
                'gender' => $user->gender,
                'maritalStatus' => $user->marital_status,
                'bloodGroup' => $user->blood_group,
                'healthCondition' => $user->health_condition,

                'bankName' => $user->bank_name,
                'accountNumber' => $user->account_number,
                'branchAddress' => $user->branch_address,
                'tinNumber' => $user->tin_number,

                'basicSalary' => $user->basic_salary,
                'grossSalary' => $user->gross_salary,
                'transportAllowance' => $user->transport_allowance,
                'familyAllowance' => $user->family_allowance,
                'othersAllowance' => $user->others_allowance,

                'address' => $user->address,
                'lastLoginAt' => $user->last_login_at,

                'roles' => $user->getRoleNames()->values(),
            ],

            'permissions' => $user->getAllPermissions()
                ->pluck('name')
                ->values(),
        ];
    }
}

