<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('purchase_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('purchase_order_id')
                ->constrained('purchase_orders')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            // Link back to requisition line (for remaining qty tracking)
            $table->unsignedBigInteger('requisition_item_id')->nullable();

            $table->unsignedBigInteger('item_id');
            $table->string('unit');
            $table->decimal('quantity', 15, 2);
            $table->decimal('unit_price', 15, 2);

            // Multiple Taxes
            $table->json('taxes')
                ->nullable();

            $table->decimal('tax_amount', 15, 2)->nullable()->default(0); // qty * price * rate/100


            $table->decimal('line_total', 15, 2)->nullable()->default(0); // (qty*price) + tax_amount

            $table->unsignedBigInteger('warehouse_id')->nullable();

            $table->timestamps();

            $table->index(['item_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_items');
    }
};
