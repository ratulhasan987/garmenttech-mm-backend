<?php

namespace Database\Seeders;

use App\Models\LeadDesignation;
use Illuminate\Database\Seeder;

class LeadDesignationSeeder extends Seeder
{
    public function run(): void
    {
        $designations = [
            [
                'name' => 'Accountant',
                'code' => 'ACCT',
                'status' => 'default',
            ],
            [
                'name' => 'Accounts',
                'code' => 'ACCOUNTS',
                'status' => 'default',
            ],
            [
                'name' => 'Admin',
                'code' => 'ADMIN',
                'status' => 'default',
            ],
            [
                'name' => 'Administration and Procurement',
                'code' => 'ADMINISTRATION_AND_PROCUREMENT',
                'status' => 'default',
            ],
            [
                'name' => 'Advisor',
                'code' => 'ADV',
                'status' => 'default',
            ],
            [
                'name' => 'Architect',
                'code' => 'ARCH',
                'status' => 'default',
            ],
            [
                'name' => 'Assistant Commissioner',
                'code' => 'ASST_COMM',
                'status' => 'default',
            ],
            [
                'name' => 'Assistant General Manager',
                'code' => 'AGM',
                'status' => 'default',
            ],
            [
                'name' => 'Assistant Manager',
                'code' => 'AM',
                'status' => 'default',
            ],
            [
                'name' => 'Assistant Professor',
                'code' => 'ASST_PROF',
                'status' => 'default',
            ],
            [
                'name' => 'Attorney',
                'code' => 'ATTY',
                'status' => 'default',
            ],
            [
                'name' => 'Auditor',
                'code' => 'AUD',
                'status' => 'default',
            ],
            [
                'name' => 'Branch Manager',
                'code' => 'BM',
                'status' => 'default',
            ],
            [
                'name' => 'Business Developer',
                'code' => 'BDEV',
                'status' => 'default',
            ],
            [
                'name' => 'Business Development Executive',
                'code' => 'BDE',
                'status' => 'default',
            ],
            [
                'name' => 'Business Development Manager',
                'code' => 'BDM',
                'status' => 'default',
            ],
            [
                'name' => 'Business Development Officer',
                'code' => 'BDO',
                'status' => 'default',
            ],
            [
                'name' => 'Chairman',
                'code' => 'CHMN',
                'status' => 'default',
            ],
            [
                'name' => 'Chief Business Officer',
                'code' => 'CBO',
                'status' => 'default',
            ],
            [
                'name' => 'Chief Engineer',
                'code' => 'CE',
                'status' => 'default',
            ],
            [
                'name' => 'CEO',
                'code' => 'CEO',
                'status' => 'default',
            ],
            [
                'name' => 'Chief Financial Officer',
                'code' => 'CFO',
                'status' => 'default',
            ],
            [
                'name' => 'Chief Marketing Officer',
                'code' => 'CMO',
                'status' => 'default',
            ],
            [
                'name' => 'Chief Operating Officer',
                'code' => 'COO',
                'status' => 'default',
            ],
            [
                'name' => 'Chief Technology Officer',
                'code' => 'CTO',
                'status' => 'default',
            ],
            [
                'name' => 'Client Management',
                'code' => 'CLIENT_MANAGEMENT',
                'status' => 'default',
            ],
            [
                'name' => 'Color Master',
                'code' => 'COLOR_MASTER',
                'status' => 'default',
            ],
            [
                'name' => 'Company Secretary',
                'code' => 'COMP_SEC',
                'status' => 'default',
            ],
            [
                'name' => 'Consultant',
                'code' => 'CONS',
                'status' => 'default',
            ],
            [
                'name' => 'Coordinator',
                'code' => 'COORD',
                'status' => 'default',
            ],
            [
                'name' => 'Correspondent',
                'code' => 'CORR',
                'status' => 'default',
            ],
            [
                'name' => 'Counselor',
                'code' => 'COUNS',
                'status' => 'default',
            ],
            [
                'name' => 'Country Manager',
                'code' => 'CM',
                'status' => 'default',
            ],
            [
                'name' => 'Creative Assistant',
                'code' => 'CREATIVE_ASSISTANT',
                'status' => 'default',
            ],
            [
                'name' => 'Deputy General Manager',
                'code' => 'DGM',
                'status' => 'default',
            ],
            [
                'name' => 'Deputy Manager',
                'code' => 'DMGR',
                'status' => 'default',
            ],
            [
                'name' => 'Deputy Managing Director',
                'code' => 'DMD',
                'status' => 'default',
            ],
            [
                'name' => 'Designer',
                'code' => 'DES',
                'status' => 'default',
            ],
            [
                'name' => 'Director',
                'code' => 'DIR',
                'status' => 'default',
            ],
            [
                'name' => 'Doctor',
                'code' => 'DR',
                'status' => 'default',
            ],
            [
                'name' => 'Editor',
                'code' => 'ED',
                'status' => 'default',
            ],
            [
                'name' => 'Educationist',
                'code' => 'EDUC',
                'status' => 'default',
            ],
            [
                'name' => 'Engineer',
                'code' => 'ENG',
                'status' => 'default',
            ],
            [
                'name' => 'Entrepreneur',
                'code' => 'ENTR',
                'status' => 'default',
            ],
            [
                'name' => 'Executive',
                'code' => 'EXE',
                'status' => 'default',
            ],
            [
                'name' => 'Executive Director',
                'code' => 'EDIR',
                'status' => 'default',
            ],
            [
                'name' => 'Foreman',
                'code' => 'FRMN',
                'status' => 'default',
            ],
            [
                'name' => 'Founder',
                'code' => 'FNDR',
                'status' => 'default',
            ],
            [
                'name' => 'Freelancer',
                'code' => 'FRLNCR',
                'status' => 'default',
            ],
            [
                'name' => 'Front Desk',
                'code' => 'FRONT_DESK',
                'status' => 'default',
            ],
            [
                'name' => 'General Manager',
                'code' => 'GM',
                'status' => 'default',
            ],
            [
                'name' => 'General Purchase',
                'code' => 'GEN_PURCHASE',
                'status' => 'default',
            ],
            [
                'name' => 'General Secretary',
                'code' => 'GEN_SEC',
                'status' => 'default',
            ],
            [
                'name' => 'Head of Department',
                'code' => 'HOD',
                'status' => 'default',
            ],
            [
                'name' => 'Head Teacher',
                'code' => 'HEAD_TEACHER',
                'status' => 'default',
            ],
            [
                'name' => 'HR',
                'code' => 'HR',
                'status' => 'default',
            ],
            [
                'name' => 'Human Resources and Administration',
                'code' => 'HRA',
                'status' => 'default',
            ],
            [
                'name' => 'In Charge',
                'code' => 'IN_CHARGE',
                'status' => 'default',
            ],
            [
                'name' => 'Information Technology',
                'code' => 'IT',
                'status' => 'default',
            ],
            [
                'name' => 'Lecturer',
                'code' => 'LECT',
                'status' => 'default',
            ],
            [
                'name' => 'Manager',
                'code' => 'MGR',
                'status' => 'default',
            ],
            [
                'name' => 'MD',
                'code' => 'MD',
                'status' => 'default',
            ],
            [
                'name' => 'Managing Partner',
                'code' => 'MP',
                'status' => 'default',
            ],
            [
                'name' => 'Marketing',
                'code' => 'MKT',
                'status' => 'default',
            ],
            [
                'name' => 'Marketing and Operations',
                'code' => 'MARKETING_AND_OPERATIONS',
                'status' => 'default',
            ],
            [
                'name' => 'Merchandiser',
                'code' => 'MERCH',
                'status' => 'default',
            ],
            [
                'name' => 'Office Assistant',
                'code' => 'OFF_ASST',
                'status' => 'default',
            ],
            [
                'name' => 'Officer',
                'code' => 'OFF',
                'status' => 'default',
            ],
            [
                'name' => 'Operations Support',
                'code' => 'OPS_SUPPORT',
                'status' => 'default',
            ],
            [
                'name' => 'Owner',
                'code' => 'OWNER',
                'status' => 'default',
            ],
            [
                'name' => 'Partner',
                'code' => 'PARTNER',
                'status' => 'default',
            ],
            [
                'name' => 'Presenter',
                'code' => 'PRESENTER',
                'status' => 'default',
            ],
            [
                'name' => 'President',
                'code' => 'PRES',
                'status' => 'default',
            ],
            [
                'name' => 'Principal',
                'code' => 'PRIN',
                'status' => 'default',
            ],
            [
                'name' => 'Proprietor',
                'code' => 'PROP',
                'status' => 'default',
            ],
            [
                'name' => 'Quality Assurance',
                'code' => 'QA',
                'status' => 'default',
            ],
            [
                'name' => 'Quality Assurance Inspector',
                'code' => 'QAI',
                'status' => 'default',
            ],
            [
                'name' => 'Receptionist',
                'code' => 'RECEP',
                'status' => 'default',
            ],
            [
                'name' => 'Representative',
                'code' => 'REP',
                'status' => 'default',
            ],
            [
                'name' => 'Sales',
                'code' => 'SALES',
                'status' => 'default',
            ],
            [
                'name' => 'Sales and Service',
                'code' => 'SALES_SERVICE',
                'status' => 'default',
            ],
            [
                'name' => 'Secretary',
                'code' => 'SEC',
                'status' => 'default',
            ],
            [
                'name' => 'Senior Advisor',
                'code' => 'SR_ADV',
                'status' => 'default',
            ],
            [
                'name' => 'Senior Assistant Manager',
                'code' => 'SAM',
                'status' => 'default',
            ],
            [
                'name' => 'Senior Consultant',
                'code' => 'SR_CONS',
                'status' => 'default',
            ],
            [
                'name' => 'Senior Counselor',
                'code' => 'SR_COUNS',
                'status' => 'default',
            ],
            [
                'name' => 'Senior Engineer',
                'code' => 'SR_ENG',
                'status' => 'default',
            ],
            [
                'name' => 'Senior Executive',
                'code' => 'SE',
                'status' => 'default',
            ],
            [
                'name' => 'Senior Executive Vice President',
                'code' => 'SEVP',
                'status' => 'default',
            ],
            [
                'name' => 'Senior General Manager',
                'code' => 'SGM',
                'status' => 'default',
            ],
            [
                'name' => 'Senior Manager',
                'code' => 'SMGR',
                'status' => 'default',
            ],
            [
                'name' => 'Senior Officer',
                'code' => 'SO',
                'status' => 'default',
            ],
            [
                'name' => 'Special Agent',
                'code' => 'SPEC_AGENT',
                'status' => 'default',
            ],
            [
                'name' => 'Specialist',
                'code' => 'SPEC',
                'status' => 'default',
            ],
            [
                'name' => 'Staff',
                'code' => 'STAFF',
                'status' => 'default',
            ],
            [
                'name' => 'Superintendent',
                'code' => 'SUPT',
                'status' => 'default',
            ],
            [
                'name' => 'Supervisor',
                'code' => 'SUPV',
                'status' => 'default',
            ],
            [
                'name' => 'Teacher',
                'code' => 'TEACH',
                'status' => 'default',
            ],
            [
                'name' => 'Team Leader',
                'code' => 'TL',
                'status' => 'default',
            ],
            [
                'name' => 'Vice Chairman',
                'code' => 'VICE_CHMN',
                'status' => 'default',
            ],
            [
                'name' => 'Vice President',
                'code' => 'VP',
                'status' => 'default',
            ],
            [
                'name' => 'Vice Principal',
                'code' => 'VICE_PRIN',
                'status' => 'default',
            ],

        ];

        foreach ($designations as $designation) {
            LeadDesignation::updateOrCreate(
                [
                    'name' => $designation['name'],
                ],
                $designation,
            );
        }
    }
}
