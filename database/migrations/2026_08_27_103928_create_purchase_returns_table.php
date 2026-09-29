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
        Schema::create('purchase_returns', function (Blueprint $table) {
            $table->id();


            $table->string('return_no')
                ->unique();


            $table->foreignId('vendor_id')
                ->constrained()
                ->cascadeOnDelete();


            $table->foreignId('purchase_order_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();


            $table->foreignId('bill_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();


            $table->foreignId('warehouse_id')
                ->constrained()
                ->cascadeOnDelete();


            $table->date('return_date');


            $table->decimal(
                'subtotal',
                15,
                2
            )->default(0);


            $table->decimal(
                'tax_amount',
                15,
                2
            )->default(0);


            $table->decimal(
                'grand_total',
                15,
                2
            )->default(0);


            $table->enum(
                'status',
                [
                    'Draft',
                    'Approved',
                    'Cancelled'
                ]
            )
                ->default('Draft');


            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();


            $table->foreignId('approved_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('document')->nullable();


            $table->text('note')
                ->nullable();


            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_returns');
    }
};
