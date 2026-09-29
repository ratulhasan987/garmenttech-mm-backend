<?php

namespace Database\Seeders;

use App\Models\Configure;
use Illuminate\Database\Seeder;

class ConfigureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Configure::create([
            'name' => 'Biztek',
            'email' => 'info@fleek.com.bd',
            'phone' => '01897621270',
            'address' => 'Floor-8, Hourse-417, Road-7, Baridhara DOHS, Dhaka',
        ]);
    }
}
