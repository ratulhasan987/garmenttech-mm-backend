<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bills', function (Blueprint $table) {
            $table->id();

            $table->string('bill_no')->unique();

            /*
            |--------------------------------------------------------------------------
            | Source
            |--------------------------------------------------------------------------
            */

            $table->foreignId('goods_received_note_id')
                ->unique()
                ->constrained('goods_received_notes')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('purchase_order_id')
                ->constrained('purchase_orders')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('vendor_id')
                ->constrained('vendors')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            /*
            |--------------------------------------------------------------------------
            | Amounts
            |--------------------------------------------------------------------------
            */

            $table->decimal('sub_total', 15, 2)
                ->default(0);

            $table->decimal('total_tax', 15, 2)
                ->default(0);

            $table->decimal('total_discount', 15, 2)
                ->default(0);

            $table->decimal('shipping_cost', 15, 2)
                ->default(0);

            $table->decimal('grand_total', 15, 2)
                ->default(0);

            $table->decimal('paid_amount', 15, 2)
                ->default(0);

            $table->decimal('due_amount', 15, 2)
                ->default(0);

            $table->enum('payment_status', [
                'Paid',
                'Due',
                'Partial-paid',
            ])->default('Due');

            $table->date('bill_date');

            $table->date('due_date')->nullable();

            $table->string('attachments')->nullable();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->index('vendor_id');
            $table->index('purchase_order_id');
            $table->index('payment_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
