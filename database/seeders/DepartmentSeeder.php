<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Management',             'code' => 'MGMT',  'status' => 'default'],
            ['name' => 'Human Resources',        'code' => 'HR',    'status' => 'actionable'],
            ['name' => 'Finance & Accounts',     'code' => 'FIN',   'status' => 'actionable'],
            ['name' => 'Sales & Marketing',      'code' => 'SM',    'status' => 'actionable'],
            ['name' => 'Information Technology', 'code' => 'IT',    'status' => 'actionable'],
            ['name' => 'Administration',         'code' => 'ADMIN', 'status' => 'actionable'],
            ['name' => 'Operations',             'code' => 'OPS',   'status' => 'actionable'],
            ['name' => 'Procurement & Supply',   'code' => 'PROC',  'status' => 'actionable'],
            ['name' => 'Customer Service',       'code' => 'CS',    'status' => 'actionable'],
            ['name' => 'Production',             'code' => 'PROD',  'status' => 'actionable'],
            ['name' => 'Quality Assurance',      'code' => 'QA',    'status' => 'actionable'],
            ['name' => 'Research & Development', 'code' => 'RND',   'status' => 'actionable'],
            ['name' => 'Project Management',     'code' => 'PM',    'status' => 'actionable'],
            ['name' => 'Engineering',            'code' => 'ENG',   'status' => 'actionable'],
            ['name' => 'Legal & Compliance',     'code' => 'LEGAL', 'status' => 'actionable'],
            ['name' => 'Audit & Risk',           'code' => 'AUDIT', 'status' => 'actionable'],
            ['name' => 'Logistics',              'code' => 'LOG',   'status' => 'actionable'],
            ['name' => 'Maintenance',            'code' => 'MAIN',  'status' => 'actionable'],
            ['name' => 'Public Relations',       'code' => 'PR',    'status' => 'actionable'],
            ['name' => 'Training & Development', 'code' => 'TD',    'status' => 'actionable'],
            ['name' => 'Security',               'code' => 'SEC',   'status' => 'actionable'],
            ['name' => 'Planning',               'code' => 'PLAN',  'status' => 'actionable'],
            ['name' => 'Warehouse',              'code' => 'WH',    'status' => 'actionable'],
            ['name' => 'Health, Safety & Environment', 'code' => 'HSE', 'status' => 'actionable'],
            ['name' => 'Corporate Affairs',      'code' => 'CA',    'status' => 'actionable'],
            ['name' => 'Design & Architecture',  'code' => 'DES',   'status' => 'actionable'],
            ['name' => 'Transport',              'code' => 'TRN',   'status' => 'actionable'],
            ['name' => 'Export & Import',        'code' => 'EXIM',  'status' => 'actionable'],
            ['name' => 'Supply Chain Management','code' => 'SCM',   'status' => 'actionable'],
        ];

        foreach ($departments as $data) {
            Department::firstOrCreate(
                ['name' => $data['name']],
                [
                    'code'   => $data['code'],
                    'status' => $data['status'],
                ]
            );
        }
    }
}
