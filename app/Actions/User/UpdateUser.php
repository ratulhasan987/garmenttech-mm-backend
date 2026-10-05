<?php

namespace App\Actions\User;

use App\Actions\File;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UpdateUser
{
    public function handle(
        User $user,
        array $data
    ): User {

        return DB::transaction(function () use ($user, $data) {

            if (!empty($data['image'])) {
                $oldImage = $user->image;

                $imagePath = File::upload(
                    $data['image'],
                    'Users'
                );

                $user->image = $imagePath;

                if ($oldImage) {
                    File::deleteFile($oldImage);
                }
            }

            $user->department_id = $data['department'];
            $user->designation_id = $data['designation'];
            $user->reporting_officer =
                $data['reporting_officer'] ?? null;
            $user->shift_id = $data['shift'];

            $user->name = $data['name'];
            $user->email = $data['email'];

            $user->role = $data['role'];

            $user->phone = $data['phone'];
            $user->mobile = $data['mobile'] ?? null;
            $user->national_id = $data['national_id'] ?? null;
            $user->emergency_contact = $data['emergency_contact'];

            $user->gender = $data['gender'] ?? null;
            $user->marital_status = $data['marital_status'] ?? null;
            $user->blood_group = $data['blood_group'] ?? null;
            $user->health_condition =
                $data['health_condition'] ?? null;

            $user->pay_frequency = $data['pay_frequency'];

            $user->bank_name = $data['bank_name'] ?? null;
            $user->account_number =
                $data['account_number'] ?? null;
            $user->branch_address =
                $data['branch_address'] ?? null;
            $user->tin_number =
                $data['tin_number'] ?? null;

            $user->joining_date = $data['joining_date'];
            $user->probation_period_end_date =
                $data['probation_period_end_date'];

            $user->basic_salary = $data['basic_salary'];

            $user->transport_allowance =
                $data['transport_allowance'] ?? 0;

            $user->family_allowance =
                $data['family_allowance'] ?? 0;

            $user->others_allowance =
                $data['others_allowance'] ?? 0;

            $user->gross_salary =
                $user->basic_salary
                + $user->transport_allowance
                + $user->family_allowance
                + $user->others_allowance;

            $user->address = $data['address'] ?? null;

            if (!empty($data['password'])) {
                $user->password = Hash::make(
                    $data['password']
                );
            }

            $user->save();

            $user->syncRoles([
                $data['role']
            ]);

            return $user;
        });
    }
}
