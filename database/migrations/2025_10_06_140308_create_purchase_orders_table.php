<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_id')->unique();

            $table->foreignId('requisition_id')
                ->nullable()
                ->constrained('requisitions')
                ->nullOnDelete();
            $table->boolean('is_requisition_based')->default(false);

            $table->foreignId('vendor_id')
                ->constrained('vendors')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->unsignedBigInteger('warehouse_id')->nullable();

            // Header totals (order_tax = SUM of item taxes)
            $table->decimal('sub_total', 15, 2)->default(0);      // excl. tax
            $table->decimal('order_tax', 15, 2)->nullable();      // sum of line taxes
            $table->decimal('order_discount', 15, 2)->nullable();
            $table->decimal('shipping_cost', 15, 2)->nullable();
            $table->decimal('grand_total', 15, 2);

            $table->string('order_date')->nullable();
            $table->string('expected_delivery')->nullable();
            $table->string('document')->nullable();
            $table->text('note')->nullable();

            $table->enum('status', ['Pending', 'Approved', 'Partial', 'Received', 'Cancelled'])
                ->default('Pending');

            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
