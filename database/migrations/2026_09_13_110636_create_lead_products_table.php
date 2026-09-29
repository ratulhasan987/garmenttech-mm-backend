<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('lead_products', function (Blueprint $table) {
            $table->id();

            $table->foreignId('lead_id')
                ->constrained('leads')
                ->cascadeOnDelete();

            $table->foreignId('product_id')
                ->constrained('products')
                ->restrictOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Snapshots
            |--------------------------------------------------------------------------
            |
            | Preserve what the user selected at the time the lead was created.
            |
            */

            $table->string('product_code');
            $table->string('product_name');
            $table->string('unit', 50)->nullable();

            /*
            |--------------------------------------------------------------------------
            | Lead Interest Details
            |--------------------------------------------------------------------------
            */

            $table->decimal('quantity', 15, 2)
                ->nullable();

            $table->decimal('estimated_price_per_unit', 15, 2)
                ->nullable();

            $table->text('remarks')
                ->nullable();

            $table->timestamps();

            $table->unique(
                [
                    'lead_id',
                    'product_id',
                ],
                'lead_products_lead_product_unique',
            );

            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lead_products');
    }
};
