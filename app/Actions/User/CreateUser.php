<?php

namespace App\Actions\User;

use App\Actions\File;
use App\Models\Document;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CreateUser
{
    public function handle(array $data): User
    {
        return DB::transaction(function () use ($data) {

            $imagePath = null;

            if (!empty($data['image'])) {
                $imagePath = File::fileUpload(
                    $data['image'],
                    'Users'
                );
            }

            $user = new User();

            $user->employee_id = $this->generateEmployeeId();

            $user->department_id = $data['department'];
            $user->designation_id = $data['designation'];
            $user->reporting_officer = $data['reporting_officer'] ?? null;
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
            $user->health_condition = $data['health_condition'] ?? null;

            $user->pay_frequency = $data['pay_frequency'];

            $user->bank_name = $data['bank_name'] ?? null;
            $user->account_number = $data['account_number'] ?? null;
            $user->branch_address = $data['branch_address'] ?? null;
            $user->tin_number = $data['tin_number'] ?? null;

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

            $user->password = Hash::make($data['password']);


            $user->image = $imagePath;

            $user->save();


            if (!empty($data['role'])) {
                $user->assignRole($data['role']);
            }

            if ($user) {
                $document = new Document();
                $user->document()->save($document);
            }

            return $user;
        });
    }

    private function generateEmployeeId(): string
    {
        $year = now()->year;

        $lastEmployee = User::query()
            ->where('employee_id', 'like', "EMP{$year}%")
            ->orderByDesc('id')
            ->first();

        $number = $lastEmployee
            ? ((int) substr($lastEmployee->employee_id, 7)) + 1
            : 1;

        return 'EMP' . $year . sprintf('%03d', $number);
    }
}
