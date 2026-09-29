<?php

namespace Database\Seeders;

use App\Models\Sector;
use Illuminate\Database\Seeder;

class SectorSeeder extends Seeder
{
    public function run(): void
    {
        $sectors = [
            'Machineries',
            'Hotel & Resort',
            'Food And Beverage',
            'Chemical',
            'Garments',
            'Education',
            'Bank',
            'Media & Communication',
            'Export, Import & Trading',
            'Garments Accessories',
            'Real Estate And Construction',
            'Tour And Travel',
            'Study Abroad',
            'Automobile',
            'Medical',
            'Training Center',
            'Coaching Center',
            'Manufacturing',
            'Agro',
            'Power Energy',
            'Education Consultancy',
        ];

        foreach ($sectors as $sectorName) {
            Sector::updateOrCreate(
                [
                    'name' => $sectorName,
                ],
                [
                    'is_active' => true,
                ],
            );
        }
    }
}
