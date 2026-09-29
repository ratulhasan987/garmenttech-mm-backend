<?php

namespace Database\Seeders;

use App\Models\Designation;
use Illuminate\Database\Seeder;

class DesignationSeeder extends Seeder
{
    public function run(): void
    {
        $designations = [
            ['name' => 'Chief Executive Officer',           'code' => 'CEO',  'status' => 'default'],
            ['name' => 'Chief Operating Officer',            'code' => 'COO',  'status' => 'actionable'],
            ['name' => 'Chief Financial Officer',            'code' => 'CFO',  'status' => 'actionable'],
            ['name' => 'Managing Director',                  'code' => 'MD',   'status' => 'actionable'],
            ['name' => 'Deputy Managing Director',           'code' => 'DMD',  'status' => 'actionable'],
            ['name' => 'General Manager',                    'code' => 'GM',   'status' => 'actionable'],
            ['name' => 'Senior Manager – HR & Administration','code' => 'SM_HR','status' => 'actionable'],
            ['name' => 'Senior Manager – Finance',           'code' => 'SM_FIN','status' => 'actionable'],
            ['name' => 'Manager – Accounts',                 'code' => 'M_ACC','status' => 'actionable'],
            ['name' => 'Manager – Operations',               'code' => 'M_OPS','status' => 'actionable'],
            ['name' => 'Assistant Manager – Sales',          'code' => 'AM_SALE','status' => 'actionable'],
            ['name' => 'Senior Executive – Marketing',       'code' => 'SE_MARK','status' => 'actionable'],
            ['name' => 'Executive – Customer Support',       'code' => 'EX_CS','status' => 'actionable'],
            ['name' => 'Junior Executive – Accounts',        'code' => 'JE_ACC','status' => 'actionable'],
            ['name' => 'Trainee / Intern',                   'code' => 'INT','status' => 'actionable'],
            ['name' => 'Clerk – Administration',             'code' => 'CL_ADM','status' => 'actionable'],
            ['name' => 'Receptionist',                       'code' => 'REC','status' => 'actionable'],
            ['name' => 'Cleaner / Support Staff',            'code' => 'SUPP','status' => 'actionable'],
        ];

        foreach ($designations as $data) {
            Designation::firstOrCreate(
                ['name' => $data['name']],
                [
                    'code'   => $data['code'],
                    'status' => $data['status'],
                ]
            );
        }
    }
}
