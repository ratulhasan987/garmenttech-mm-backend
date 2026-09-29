<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('warehouse_id')
                ->constrained('warehouses')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | item_id = products.id
            |--------------------------------------------------------------------------
            */

            $table->unsignedBigInteger('item_id');

            $table->string('unit', 50)->nullable();

            $table->decimal('quantity', 15, 2)
                ->default(0);

            $table->decimal('reserved_quantity', 15, 2)
                ->default(0);

            $table->timestamps();

            $table->unique(
                [
                    'warehouse_id',
                    'item_id',
                ],
                'stocks_warehouse_item_unique'
            );

            $table->index('item_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};
