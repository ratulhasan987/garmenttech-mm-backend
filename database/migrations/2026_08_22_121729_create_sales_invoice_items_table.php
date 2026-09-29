<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(
            'sales_invoice_items',
            function (Blueprint $table) {
                $table->id();

                $table->foreignId(
                    'sales_invoice_id'
                )
                    ->constrained(
                        'sales_invoices'
                    )
                    ->cascadeOnDelete();

                $table->foreignId(
                    'product_id'
                )
                    ->constrained(
                        'products'
                    )
                    ->restrictOnDelete();

                $table->decimal(
                    'quantity',
                    15,
                    2
                );

                $table->decimal(
                    'unit_price',
                    15,
                    2
                );

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

                $table->decimal(
                    'line_total',
                    15,
                    2
                );

                $table->timestamps();

                $table->index([
                    'sales_invoice_id',
                    'product_id',
                ]);
            }
        );
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'sales_invoice_items'
        );
    }
};