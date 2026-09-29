<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {

        ## Base country United States
        // $currencies = [
        //     [
        //         'currency_code' => 'USD',
        //         'currency_name' => 'United States Dollar',
        //         'symbol' => '$',
        //         'country' => 'United States',
        //         'exchange_rate' => 1.000000,
        //         'is_active' => true,
        //     ],
        //     [
        //         'currency_code' => 'EUR',
        //         'currency_name' => 'Euro',
        //         'symbol' => '€',
        //         'country' => 'Eurozone',
        //         'exchange_rate' => 0.900000,
        //         'is_active' => false,
        //     ],
        //     [
        //         'currency_code' => 'GBP',
        //         'currency_name' => 'British Pound Sterling',
        //         'symbol' => '£',
        //         'country' => 'United Kingdom',
        //         'exchange_rate' => 0.800000,
        //         'is_active' => false,
        //     ],
        //     [
        //         'currency_code' => 'JPY',
        //         'currency_name' => 'Japanese Yen',
        //         'symbol' => '¥',
        //         'country' => 'Japan',
        //         'exchange_rate' => 110.000000,
        //         'is_active' => false,
        //     ],
        //     [
        //         'currency_code' => 'INR',
        //         'currency_name' => 'Indian Rupee',
        //         'symbol' => '₹',
        //         'country' => 'India',
        //         'exchange_rate' => 74.000000,
        //         'is_active' => false,
        //     ],
        //     [
        //         'currency_code' => 'BDT',
        //         'currency_name' => 'Bangladeshi Taka',
        //         'symbol' => '৳',
        //         'country' => 'Bangladesh',
        //         'exchange_rate' => 108.000000,
        //         'is_active' => false,
        //     ],
        // ];

        ## Base country Bangladesh
        $currencies = [
            [
                'currency_code' => 'BDT',
                'currency_name' => 'Bangladeshi Taka',
                'symbol' => '৳',
                'country' => 'Bangladesh',
                'exchange_rate' => 1.000000,  // Base currency
                'is_active' => true,          // BDT is active by default
            ],
            [
                'currency_code' => 'USD',
                'currency_name' => 'United States Dollar',
                'symbol' => '$',
                'country' => 'United States',
                'exchange_rate' => 0.0093,    // 1 BDT ≈ 0.0093 USD
                'is_active' => false,
            ],
            [
                'currency_code' => 'EUR',
                'currency_name' => 'Euro',
                'symbol' => '€',
                'country' => 'Eurozone',
                'exchange_rate' => 0.0084,    // 1 BDT ≈ 0.0084 EUR
                'is_active' => false,
            ],
            [
                'currency_code' => 'GBP',
                'currency_name' => 'British Pound Sterling',
                'symbol' => '£',
                'country' => 'United Kingdom',
                'exchange_rate' => 0.0073,    // 1 BDT ≈ 0.0073 GBP
                'is_active' => false,
            ],
            [
                'currency_code' => 'JPY',
                'currency_name' => 'Japanese Yen',
                'symbol' => '¥',
                'country' => 'Japan',
                'exchange_rate' => 1.23,      // 1 BDT ≈ 1.23 JPY
                'is_active' => false,
            ],
            [
                'currency_code' => 'INR',
                'currency_name' => 'Indian Rupee',
                'symbol' => '₹',
                'country' => 'India',
                'exchange_rate' => 0.76,      // 1 BDT ≈ 0.76 INR
                'is_active' => false,
            ],
        ];


        foreach ($currencies as $currency) {
            Currency::updateOrCreate(
                ['currency_code' => $currency['currency_code']],
                $currency
            );
        }
    }
}
