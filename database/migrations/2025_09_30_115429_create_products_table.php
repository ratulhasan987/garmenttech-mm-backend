<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            // Product
            $table->string('code')->unique();
            $table->string('name');

            // Category
            $table->foreignId('product_category_id')
                ->constrained('product_categories')
                ->restrictOnDelete();

            // Brand
            $table->foreignId('product_brand_id')
                ->nullable()
                ->constrained('product_brands')
                ->nullOnDelete();

            // Unit
            $table->foreignId('unit_id')
                ->constrained('units')
                ->restrictOnDelete();

            // Inventory
            $table->decimal('reorder_level', 15, 2)
                ->default(0);

            // Prices
            $table->decimal('purchase_price', 15, 2)
                ->default(0);

            $table->decimal('sales_price', 15, 2)
                ->default(0);

            // Taxes
            $table->json('purchase_tax_ids')
                ->nullable();

            $table->json('sales_tax_ids')
                ->nullable();

            // Status
            $table->boolean('status')
                ->default(true);

            // Description
            $table->text('description')
                ->nullable();

            $table->timestamps();

            // Indexes
            $table->index('name');

            $table->index([
                'product_category_id',
                'product_brand_id',
            ]);

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};