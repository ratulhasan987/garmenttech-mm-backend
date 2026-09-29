<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //General Shift
        $generalShift = Shift::query()
            ->where(
                'name',
                'General Shift'
            )
            ->firstOrFail();

        //Super Admin
        $user = User::where(
            'email',
            'superadmin@gmail.com'
        )->first();

        if (is_null($user)) {

            //Generate Employee ID
            $year = date('Y');

            $lastEmployee = User::where(
                'employee_id',
                'LIKE',
                "EMP{$year}%"
            )
                ->orderBy(
                    'id',
                    'desc'
                )
                ->first();

            if ($lastEmployee) {
                $lastEmployeeNumber =
                    intval(
                        substr(
                            $lastEmployee->employee_id,
                            7
                        )
                    );

                $newEmployeeIdNumber =
                    $lastEmployeeNumber + 1;
            } else {
                $newEmployeeIdNumber = 1;
            }

            $employeeId =
                'EMP' .
                $year .
                sprintf(
                    '%03d',
                    $newEmployeeIdNumber
                );

            // Create Super Admin
            $user = new User();

            $user->employee_id =
                $employeeId;

            $user->role =
                'superadmin';

            $user->name =
                'Super Admin';

            $user->basic_salary =
                50000;

            $user->email =
                'superadmin@gmail.com';

            $user->password =
                Hash::make(
                    'superadmin123'
                );

            // Assign Shift
            $user->shift_id =
                $generalShift->id;

            $user->save();

            $user->assignRole(
                'superadmin'
            );

            // User Document
            $document =
                new Document();

            $user
                ->document()
                ->save(
                    $document
                );
        } else {

            if (
                (int) $user->shift_id !==
                (int) $generalShift->id
            ) {
                $user->shift_id =
                    $generalShift->id;

                $user->save();
            }


            if (
                !$user->hasRole(
                    'superadmin'
                )
            ) {
                $user->assignRole(
                    'superadmin'
                );
            }
        }
    }
}