<?php

namespace Database\Seeders;

use App\Models\Stock;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestingSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {

            /*
            |--------------------------------------------------------------------------
            | Warehouses 1 - 5
            |--------------------------------------------------------------------------
            */

            for ($warehouseId = 1; $warehouseId <= 5; $warehouseId++) {

                /*
                |--------------------------------------------------------------------------
                | Products 1 - 25
                |--------------------------------------------------------------------------
                */

                for ($productId = 1; $productId <= 25; $productId++) {

                    /*
                    |--------------------------------------------------------------------------
                    | Random Stock
                    |--------------------------------------------------------------------------
                    */

                    $quantity = fake()->randomFloat(
                        2,
                        50,
                        1000
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Reserved Stock
                    |--------------------------------------------------------------------------
                    */

                    $reservedQuantity = fake()->boolean(40)
                        ? fake()->randomFloat(
                            2,
                            0,
                            $quantity * 0.25
                        )
                        : 0;

                    /*
                    |--------------------------------------------------------------------------
                    | Create / Update
                    |--------------------------------------------------------------------------
                    */

                    Stock::updateOrCreate(
                        [
                            'warehouse_id' =>
                                $warehouseId,

                            /*
                            | item_id = products.id
                            */
                            'item_id' =>
                                $productId,
                        ],
                        [
                            'unit' =>
                                fake()->randomElement([
                                    'PCS',
                                    'KG',
                                    'BOX',
                                    'ROLL',
                                    'METER',
                                ]),

                            'quantity' =>
                                round(
                                    $quantity,
                                    2
                                ),

                            'reserved_quantity' =>
                                round(
                                    $reservedQuantity,
                                    2
                                ),
                        ]
                    );
                }
            }
        });

        $this->command->info(
            'Product stock seeded successfully: 25 products × 5 warehouses = 125 stock records.'
        );
    }
}