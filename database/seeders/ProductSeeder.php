<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductBrand;
use App\Models\ProductCategory;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Units
        |--------------------------------------------------------------------------
        |
        | Units are created by UnitSeeder.
        |
        */

        $pieceUnit =
            Unit::where(
                'name',
                'Piece'
            )->firstOrFail();

        $boxUnit =
            Unit::where(
                'name',
                'Box'
            )->firstOrFail();

        $packetUnit =
            Unit::where(
                'name',
                'Packet'
            )->firstOrFail();

        $kgUnit =
            Unit::where(
                'name',
                'Kg'
            )->firstOrFail();

        $litreUnit =
            Unit::where(
                'name',
                'Litre'
            )->firstOrFail();

        $rollUnit =
            Unit::where(
                'name',
                'Roll'
            )->firstOrFail();

        $setUnit =
            Unit::where(
                'name',
                'Set'
            )->firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | Main Categories
        |--------------------------------------------------------------------------
        */

        $electronics =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Electronics',

                'parent_id' =>
                    null,
            ]);

        $officeSupplies =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Office Supplies',

                'parent_id' =>
                    null,
            ]);

        $furniture =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Furniture',

                'parent_id' =>
                    null,
            ]);

        $cleaningSupplies =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Cleaning Supplies',

                'parent_id' =>
                    null,
            ]);

        $electrical =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Electrical',

                'parent_id' =>
                    null,
            ]);

        /*
        |--------------------------------------------------------------------------
        | Electronics Subcategories
        |--------------------------------------------------------------------------
        */

        $computers =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Computers & Laptops',

                'parent_id' =>
                    $electronics->id,
            ]);

        $computerAccessories =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Computer Accessories',

                'parent_id' =>
                    $electronics->id,
            ]);

        $networking =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Networking',

                'parent_id' =>
                    $electronics->id,
            ]);

        $printers =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Printers & Scanners',

                'parent_id' =>
                    $electronics->id,
            ]);

        /*
        |--------------------------------------------------------------------------
        | Office Supplies Subcategories
        |--------------------------------------------------------------------------
        */

        $stationery =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Stationery',

                'parent_id' =>
                    $officeSupplies->id,
            ]);

        $paperProducts =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Paper Products',

                'parent_id' =>
                    $officeSupplies->id,
            ]);

        $officeAccessories =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Office Accessories',

                'parent_id' =>
                    $officeSupplies->id,
            ]);

        /*
        |--------------------------------------------------------------------------
        | Furniture Subcategories
        |--------------------------------------------------------------------------
        */

        $chairs =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Chairs',

                'parent_id' =>
                    $furniture->id,
            ]);

        $tables =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Tables',

                'parent_id' =>
                    $furniture->id,
            ]);

        $storageCabinets =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Storage & Cabinets',

                'parent_id' =>
                    $furniture->id,
            ]);

        /*
        |--------------------------------------------------------------------------
        | Cleaning Subcategories
        |--------------------------------------------------------------------------
        */

        $cleaningTools =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Cleaning Tools',

                'parent_id' =>
                    $cleaningSupplies->id,
            ]);

        $cleaningChemicals =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Cleaning Chemicals',

                'parent_id' =>
                    $cleaningSupplies->id,
            ]);

        /*
        |--------------------------------------------------------------------------
        | Electrical Subcategories
        |--------------------------------------------------------------------------
        */

        $lighting =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Lighting',

                'parent_id' =>
                    $electrical->id,
            ]);

        $electricalAccessories =
            ProductCategory::firstOrCreate([
                'name' =>
                    'Electrical Accessories',

                'parent_id' =>
                    $electrical->id,
            ]);

        /*
        |--------------------------------------------------------------------------
        | Brands
        |--------------------------------------------------------------------------
        */

        $dell =
            ProductBrand::firstOrCreate([
                'name' =>
                    'Dell',
            ]);

        $hp =
            ProductBrand::firstOrCreate([
                'name' =>
                    'HP',
            ]);

        $logitech =
            ProductBrand::firstOrCreate([
                'name' =>
                    'Logitech',
            ]);

        $tpLink =
            ProductBrand::firstOrCreate([
                'name' =>
                    'TP-Link',
            ]);

        $canon =
            ProductBrand::firstOrCreate([
                'name' =>
                    'Canon',
            ]);

        $epson =
            ProductBrand::firstOrCreate([
                'name' =>
                    'Epson',
            ]);

        $faberCastell =
            ProductBrand::firstOrCreate([
                'name' =>
                    'Faber-Castell',
            ]);

        $doubleA =
            ProductBrand::firstOrCreate([
                'name' =>
                    'Double A',
            ]);

        $philips =
            ProductBrand::firstOrCreate([
                'name' =>
                    'Philips',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Products
        |--------------------------------------------------------------------------
        */

        $products = [
            /*
            |--------------------------------------------------------------------------
            | Computers
            |--------------------------------------------------------------------------
            */

            [
                'code' =>
                    'PRD-0001',

                'name' =>
                    'Dell Latitude Laptop',

                'product_category_id' =>
                    $computers->id,

                'product_brand_id' =>
                    $dell->id,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    5,

                'status' =>
                    true,

                'description' =>
                    'Dell Latitude business laptop.',
            ],

            [
                'code' =>
                    'PRD-0002',

                'name' =>
                    'HP ProBook Laptop',

                'product_category_id' =>
                    $computers->id,

                'product_brand_id' =>
                    $hp->id,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    5,

                'status' =>
                    true,

                'description' =>
                    'HP ProBook business laptop.',
            ],

            /*
            |--------------------------------------------------------------------------
            | Computer Accessories
            |--------------------------------------------------------------------------
            */

            [
                'code' =>
                    'PRD-0003',

                'name' =>
                    'Logitech Wireless Mouse',

                'product_category_id' =>
                    $computerAccessories->id,

                'product_brand_id' =>
                    $logitech->id,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    20,

                'status' =>
                    true,

                'description' =>
                    'Wireless optical mouse.',
            ],

            [
                'code' =>
                    'PRD-0004',

                'name' =>
                    'Logitech USB Keyboard',

                'product_category_id' =>
                    $computerAccessories->id,

                'product_brand_id' =>
                    $logitech->id,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    20,

                'status' =>
                    true,

                'description' =>
                    'Standard USB office keyboard.',
            ],

            [
                'code' =>
                    'PRD-0005',

                'name' =>
                    'HP 24 Inch Monitor',

                'product_category_id' =>
                    $computerAccessories->id,

                'product_brand_id' =>
                    $hp->id,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    5,

                'status' =>
                    true,

                'description' =>
                    '24 inch office monitor.',
            ],

            /*
            |--------------------------------------------------------------------------
            | Networking
            |--------------------------------------------------------------------------
            */

            [
                'code' =>
                    'PRD-0006',

                'name' =>
                    'TP-Link WiFi Router',

                'product_category_id' =>
                    $networking->id,

                'product_brand_id' =>
                    $tpLink->id,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    10,

                'status' =>
                    true,

                'description' =>
                    'Wireless office router.',
            ],

            [
                'code' =>
                    'PRD-0007',

                'name' =>
                    'TP-Link 8 Port Switch',

                'product_category_id' =>
                    $networking->id,

                'product_brand_id' =>
                    $tpLink->id,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    10,

                'status' =>
                    true,

                'description' =>
                    '8 port network switch.',
            ],

            /*
            |--------------------------------------------------------------------------
            | Printers
            |--------------------------------------------------------------------------
            */

            [
                'code' =>
                    'PRD-0008',

                'name' =>
                    'Canon Laser Printer',

                'product_category_id' =>
                    $printers->id,

                'product_brand_id' =>
                    $canon->id,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    3,

                'status' =>
                    true,

                'description' =>
                    'Office laser printer.',
            ],

            [
                'code' =>
                    'PRD-0009',

                'name' =>
                    'Epson Color Printer',

                'product_category_id' =>
                    $printers->id,

                'product_brand_id' =>
                    $epson->id,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    3,

                'status' =>
                    true,

                'description' =>
                    'Color ink tank printer.',
            ],

            /*
            |--------------------------------------------------------------------------
            | Stationery
            |--------------------------------------------------------------------------
            */

            [
                'code' =>
                    'PRD-0010',

                'name' =>
                    'Ball Pen',

                'product_category_id' =>
                    $stationery->id,

                'product_brand_id' =>
                    $faberCastell->id,

                'unit_id' =>
                    $boxUnit->id,

                'reorder_level' =>
                    20,

                'status' =>
                    true,

                'description' =>
                    'Office ball pen box.',
            ],

            [
                'code' =>
                    'PRD-0011',

                'name' =>
                    'Permanent Marker',

                'product_category_id' =>
                    $stationery->id,

                'product_brand_id' =>
                    $faberCastell->id,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    20,

                'status' =>
                    true,

                'description' =>
                    'Permanent marker.',
            ],

            [
                'code' =>
                    'PRD-0012',

                'name' =>
                    'Stapler Machine',

                'product_category_id' =>
                    $officeAccessories->id,

                'product_brand_id' =>
                    null,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    10,

                'status' =>
                    true,

                'description' =>
                    'Standard office stapler machine.',
            ],

            [
                'code' =>
                    'PRD-0013',

                'name' =>
                    'Stapler Pin',

                'product_category_id' =>
                    $officeAccessories->id,

                'product_brand_id' =>
                    null,

                'unit_id' =>
                    $boxUnit->id,

                'reorder_level' =>
                    20,

                'status' =>
                    true,

                'description' =>
                    'Stapler pin box.',
            ],

            /*
            |--------------------------------------------------------------------------
            | Paper Products
            |--------------------------------------------------------------------------
            */

            [
                'code' =>
                    'PRD-0014',

                'name' =>
                    'A4 Paper 80 GSM',

                'product_category_id' =>
                    $paperProducts->id,

                'product_brand_id' =>
                    $doubleA->id,

                'unit_id' =>
                    $packetUnit->id,

                'reorder_level' =>
                    50,

                'status' =>
                    true,

                'description' =>
                    'A4 size 80 GSM photocopy paper.',
            ],

            [
                'code' =>
                    'PRD-0015',

                'name' =>
                    'Sticky Notes',

                'product_category_id' =>
                    $paperProducts->id,

                'product_brand_id' =>
                    null,

                'unit_id' =>
                    $packetUnit->id,

                'reorder_level' =>
                    20,

                'status' =>
                    true,

                'description' =>
                    'Office sticky note packet.',
            ],

            /*
            |--------------------------------------------------------------------------
            | Furniture
            |--------------------------------------------------------------------------
            */

            [
                'code' =>
                    'PRD-0016',

                'name' =>
                    'Executive Office Chair',

                'product_category_id' =>
                    $chairs->id,

                'product_brand_id' =>
                    null,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    5,

                'status' =>
                    true,

                'description' =>
                    'Executive office chair.',
            ],

            [
                'code' =>
                    'PRD-0017',

                'name' =>
                    'Visitor Chair',

                'product_category_id' =>
                    $chairs->id,

                'product_brand_id' =>
                    null,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    10,

                'status' =>
                    true,

                'description' =>
                    'Office visitor chair.',
            ],

            [
                'code' =>
                    'PRD-0018',

                'name' =>
                    'Office Desk',

                'product_category_id' =>
                    $tables->id,

                'product_brand_id' =>
                    null,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    5,

                'status' =>
                    true,

                'description' =>
                    'Standard office desk.',
            ],

            [
                'code' =>
                    'PRD-0019',

                'name' =>
                    'Conference Table',

                'product_category_id' =>
                    $tables->id,

                'product_brand_id' =>
                    null,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    2,

                'status' =>
                    true,

                'description' =>
                    'Office conference table.',
            ],

            [
                'code' =>
                    'PRD-0020',

                'name' =>
                    'Steel Filing Cabinet',

                'product_category_id' =>
                    $storageCabinets->id,

                'product_brand_id' =>
                    null,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    5,

                'status' =>
                    true,

                'description' =>
                    'Steel filing cabinet.',
            ],

            /*
            |--------------------------------------------------------------------------
            | Cleaning Tools
            |--------------------------------------------------------------------------
            */

            [
                'code' =>
                    'PRD-0021',

                'name' =>
                    'Floor Mop',

                'product_category_id' =>
                    $cleaningTools->id,

                'product_brand_id' =>
                    null,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    10,

                'status' =>
                    true,

                'description' =>
                    'Floor cleaning mop.',
            ],

            [
                'code' =>
                    'PRD-0022',

                'name' =>
                    'Cleaning Brush Set',

                'product_category_id' =>
                    $cleaningTools->id,

                'product_brand_id' =>
                    null,

                'unit_id' =>
                    $setUnit->id,

                'reorder_level' =>
                    10,

                'status' =>
                    true,

                'description' =>
                    'Cleaning brush set.',
            ],

            /*
            |--------------------------------------------------------------------------
            | Cleaning Chemicals
            |--------------------------------------------------------------------------
            */

            [
                'code' =>
                    'PRD-0023',

                'name' =>
                    'Floor Cleaner',

                'product_category_id' =>
                    $cleaningChemicals->id,

                'product_brand_id' =>
                    null,

                'unit_id' =>
                    $litreUnit->id,

                'reorder_level' =>
                    15,

                'status' =>
                    true,

                'description' =>
                    'Liquid floor cleaning solution.',
            ],

            [
                'code' =>
                    'PRD-0024',

                'name' =>
                    'Glass Cleaner',

                'product_category_id' =>
                    $cleaningChemicals->id,

                'product_brand_id' =>
                    null,

                'unit_id' =>
                    $litreUnit->id,

                'reorder_level' =>
                    10,

                'status' =>
                    true,

                'description' =>
                    'Glass cleaning liquid.',
            ],

            /*
            |--------------------------------------------------------------------------
            | Electrical
            |--------------------------------------------------------------------------
            */

            [
                'code' =>
                    'PRD-0025',

                'name' =>
                    'Philips LED Bulb',

                'product_category_id' =>
                    $lighting->id,

                'product_brand_id' =>
                    $philips->id,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    20,

                'status' =>
                    true,

                'description' =>
                    'Energy efficient LED bulb.',
            ],

            [
                'code' =>
                    'PRD-0026',

                'name' =>
                    'Extension Socket',

                'product_category_id' =>
                    $electricalAccessories->id,

                'product_brand_id' =>
                    null,

                'unit_id' =>
                    $pieceUnit->id,

                'reorder_level' =>
                    10,

                'status' =>
                    true,

                'description' =>
                    'Multi socket electrical extension.',
            ],

            [
                'code' =>
                    'PRD-0027',

                'name' =>
                    'Electrical Cable Roll',

                'product_category_id' =>
                    $electricalAccessories->id,

                'product_brand_id' =>
                    null,

                'unit_id' =>
                    $rollUnit->id,

                'reorder_level' =>
                    5,

                'status' =>
                    true,

                'description' =>
                    'Electrical cable roll.',
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | Create / Update Products
        |--------------------------------------------------------------------------
        */

        foreach (
            $products
            as $product
        ) {
            Product::updateOrCreate(
                [
                    'code' =>
                        $product[
                            'code'
                        ],
                ],
                [
                    'name' =>
                        $product[
                            'name'
                        ],

                    'product_category_id' =>
                        $product[
                            'product_category_id'
                        ],

                    'product_brand_id' =>
                        $product[
                            'product_brand_id'
                        ],

                    'unit_id' =>
                        $product[
                            'unit_id'
                        ],

                    'reorder_level' =>
                        $product[
                            'reorder_level'
                        ],

                    'status' =>
                        $product[
                            'status'
                        ],

                    'description' =>
                        $product[
                            'description'
                        ],
                ]
            );
        }
    }
}
