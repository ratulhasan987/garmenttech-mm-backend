<?php

namespace Database\Seeders;

use App\Models\Shift;
use Illuminate\Database\Seeder;

class ShiftSeeder extends Seeder
{
    public function run(): void
    {
        $shifts = [
            [
                'name' => 'General Shift',
                'shift_start_time' => '09:00 AM',
                'shift_end_time' => '06:00 PM',
                'first_half_shift_end_time' => '01:00 PM',
                'second_half_shift_start_time' => '02:00 PM',
                'weekends' => 'Friday',
            ],
        ];

        foreach ($shifts as $shift) {
            Shift::updateOrCreate(
                [
                    'name' => $shift['name'],
                ],
                $shift
            );
        }
    }
}