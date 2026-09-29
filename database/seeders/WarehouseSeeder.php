<?php

namespace Database\Seeders;

use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class WarehouseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $warehouses = [
            [
                'code' => 'WH-001',
                'name' => 'Main Warehouse',
                'phone' => '01710000001',
                'address' => 'Dhaka, Bangladesh',
                'status' => true,
            ],

            [
                'code' => 'WH-002',
                'name' => 'Central Distribution Warehouse',
                'phone' => '01710000002',
                'address' => 'Tejgaon, Dhaka, Bangladesh',
                'status' => true,
            ],

            [
                'code' => 'WH-003',
                'name' => 'North Warehouse',
                'phone' => '01710000003',
                'address' => 'Uttara, Dhaka, Bangladesh',
                'status' => true,
            ],

            [
                'code' => 'WH-004',
                'name' => 'South Warehouse',
                'phone' => '01710000004',
                'address' => 'Jatrabari, Dhaka, Bangladesh',
                'status' => true,
            ],

            [
                'code' => 'WH-005',
                'name' => 'Chattogram Warehouse',
                'phone' => '01710000005',
                'address' => 'Agrabad, Chattogram, Bangladesh',
                'status' => true,
            ],

            [
                'code' => 'WH-006',
                'name' => 'Khulna Warehouse',
                'phone' => '01710000006',
                'address' => 'Sonadanga, Khulna, Bangladesh',
                'status' => true,
            ],

            [
                'code' => 'WH-007',
                'name' => 'Rajshahi Warehouse',
                'phone' => '01710000007',
                'address' => 'Boalia, Rajshahi, Bangladesh',
                'status' => true,
            ],

            [
                'code' => 'WH-008',
                'name' => 'Sylhet Warehouse',
                'phone' => '01710000008',
                'address' => 'Zindabazar, Sylhet, Bangladesh',
                'status' => true,
            ],

            [
                'code' => 'WH-009',
                'name' => 'Backup Warehouse',
                'phone' => null,
                'address' => 'Dhaka, Bangladesh',
                'status' => false,
            ],
        ];

        foreach ($warehouses as $warehouse) {
            Warehouse::updateOrCreate(
                [
                    'code' => $warehouse['code'],
                ],
                [
                    'name' => $warehouse['name'],
                    'phone' => $warehouse['phone'],
                    'address' => $warehouse['address'],
                    'status' => $warehouse['status'],
                ]
            );
        }
    }
}
