<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            // General units
            'Piece', 'Kg', 'Gram', 'Litre', 'Millilitre',
            'Meter', 'Centimeter', 'Millimeter', 'Inch', 'Foot',
            'Square Meter', 'Square Foot', 'Cubic Meter', 'Cubic Foot',
            'Tonne', 'Pound', 'Gallon', 'Hour', 'Day', 'Week', 'Month', 'Year',
            'Bag', 'Box', 'Packet', 'Roll', 'Set', 'Pair', 'Dozen', 'Unit',

            // Land-related units (Bangladesh context)
            'Katha', 'Bigha', 'Acre', 'Decimal', 'Hectare', 'Shotok',
            'Square Yard', 'Square Inch', 'Square Mile',
            'Gonda', 'Link', 'Chain', 'Rood', 'Perch'
        ];

        foreach ($units as $unit) {
            Unit::firstOrCreate([
                'name' => $unit,
            ]);
        }
    }
}
