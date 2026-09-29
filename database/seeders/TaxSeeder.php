<?php

namespace Database\Seeders;

use App\Models\Tax;
use Illuminate\Database\Seeder;

class TaxSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $taxes = [
            [
                'name' => 'VAT 5%',
                'rate' => 5.00,
                'created_by' => null,
            ],

            [
                'name' => 'VAT 7.5%',
                'rate' => 7.50,
                'created_by' => null,
            ],

            [
                'name' => 'VAT 10%',
                'rate' => 10.00,
                'created_by' => null,
            ],

            [
                'name' => 'VAT 15%',
                'rate' => 15.00,
                'created_by' => null,
            ],

            [
                'name' => 'Tax 2%',
                'rate' => 2.00,
                'created_by' => null,
            ],

            [
                'name' => 'Tax 5%',
                'rate' => 5.00,
                'created_by' => null,
            ],

            [
                'name' => 'Tax 10%',
                'rate' => 10.00,
                'created_by' => null,
            ],
        ];

        foreach ($taxes as $tax) {
            Tax::updateOrCreate(
                [
                    'name' => $tax['name'],
                ],
                [
                    'rate' => $tax['rate'],
                    'created_by' => $tax['created_by'],
                ]
            );
        }
    }
}
