<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
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

            /*
            |--------------------------------------------------------------------------
            | + quantity = Stock IN
            | - quantity = Stock OUT
            |--------------------------------------------------------------------------
            */

            $table->decimal('quantity', 15, 2);

            $table->enum('movement', [
                'GRN',
                'Issue',
                'TransferIn',
                'TransferOut',
                'Adjustment',
                'PurchaseReturn',
                'SalesReturn',
            ]);

            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();

            $table->string('remarks')->nullable();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->index([
                'warehouse_id',
                'item_id',
            ]);

            $table->index('movement');

            $table->index([
                'reference_type',
                'reference_id',
            ]);

            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
