<?php

namespace Database\Seeders;

use App\Models\Attendance;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        // Change this to the user ID you want to seed attendance for.
        $userId = 1;

        $records = [
            [
                'date' => '2026-09-01',
                'attendance_status' => 'present',
                'checked_in_at' => '09:00 AM',
                'checked_out_at' => '06:00 PM',
            ],
            [
                'date' => '2026-09-02',
                'attendance_status' => 'present',
                'checked_in_at' => '09:05 AM',
                'checked_out_at' => '06:10 PM',
            ],
            [
                'date' => '2026-09-03',
                'attendance_status' => 'present',
                'checked_in_at' => '08:55 AM',
                'checked_out_at' => '05:55 PM',
            ],
            [
                'date' => '2026-09-05',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-06',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-07',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-08',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-09',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-10',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-12',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-13',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-14',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-15',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-16',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-17',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-19',
                'attendance_status' => 'absent',
                'checked_in_at' => null,
                'checked_out_at' => null,
            ],
            [
                'date' => '2026-09-20',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-21',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-22',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-23',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-24',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-26',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-27',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-28',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-29',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
            [
                'date' => '2026-09-30',
                'attendance_status' => 'present',
                'checked_in_at' => '09:10 AM',
                'checked_out_at' => '06:05 PM',
            ],
        ];

        foreach ($records as $record) {
            $createdAt = Carbon::parse(
                $record['date'] . ' 00:00:00'
            );

            Attendance::create([
                'user_id' => $userId,

                'attendance_status' => $record['attendance_status'],

                'checked_in_at' => $record['checked_in_at'],
                'checked_out_at' => $record['checked_out_at'],

                'type_of_leave' => null,

                'checked_in_at_note' => null,
                'checked_out_at_note' => null,

                'attendance_type' => 'ip',

                'latitude' => null,
                'longitude' => null,
                'location_address' => null,

                'biometric_method' => 'none',
                'biometric_id' => null,

                'device_info' => 'Seeder',

                'modification_by' => null,

                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }
    }
}
