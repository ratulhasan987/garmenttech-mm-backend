<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_invoices', function (Blueprint $table) {

            // sales invoice
            $table->id();

            $table->string('invoice_no')
                ->unique();

            // customer
            $table->foreignId('client_id')
                ->constrained('clients')
                ->restrictOnDelete();

            // warehouse
            $table->foreignId('warehouse_id')
                ->constrained('warehouses')
                ->restrictOnDelete();

            $table->date('invoice_date');


            // amount calculation
            $table->decimal(
                'subtotal',
                15,
                2
            )->default(0);


            $table->decimal(
                'discount',
                15,
                2
            )->default(0);


            $table->decimal(
                'tax',
                15,
                2
            )->default(0);


            // adjustment can be + or -
            // Example: -20 discount adjustment
            // Example: +100 extra charge
            $table->decimal(
                'adjustment_amount',
                15,
                2
            )->default(0);


            $table->decimal(
                'grand_total',
                15,
                2
            )->default(0);


            // payment
            $table->decimal(
                'paid_amount',
                15,
                2
            )->default(0);


            $table->decimal(
                'due_amount',
                15,
                2
            )->default(0);


            // status
            $table->string(
                'status',
                20
            )->default('Pending');


            $table->string(
                'payment_status',
                20
            )->default('unpaid');


            $table->text('remarks')
                ->nullable();


            $table->timestamps();


            // indexes
            $table->index([
                'client_id',
                'invoice_date',
            ]);

            $table->index([
                'warehouse_id',
                'invoice_date',
            ]);

            $table->index('status');

            $table->index(
                'payment_status'
            );
        });
    }


    public function down(): void
    {
        Schema::dropIfExists(
            'sales_invoices'
        );
    }
};