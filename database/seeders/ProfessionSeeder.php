<?php

namespace Database\Seeders;

use App\Models\Profession;
use Illuminate\Database\Seeder;

class ProfessionSeeder extends Seeder
{
    public function run(): void
    {
        $professions = [
            'Business Owner',
            'Entrepreneur',
            'Managing Director',
            'Director',
            'CEO',
            'General Manager',
            'Manager',
            'Engineer',
            'Accountant',
            'Consultant',
            'Sales & Marketing Professional',
            'IT Professional',
            'Doctor',
            'Lawyer',
            'Teacher',
            'Government Employee',
            'Private',
            'Freelancer',
            'Student',
            'Other',
        ];

        foreach ($professions as $professionName) {
            Profession::updateOrCreate(
                [
                    'name' => $professionName,
                ],
                [
                    'is_active' => true,
                ],
            );
        }
    }
}
