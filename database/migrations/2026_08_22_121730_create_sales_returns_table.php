<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(
            'sales_returns',
            function (Blueprint $table) {
                $table->id();

                $table->string(
                    'return_no'
                )->unique();

                $table->foreignId(
                    'sales_invoice_id'
                )
                    ->constrained(
                        'sales_invoices'
                    )
                    ->restrictOnDelete();

                $table->foreignId(
                    'warehouse_id'
                )
                    ->constrained(
                        'warehouses'
                    )
                    ->restrictOnDelete();

                $table->date(
                    'return_date'
                );

                $table->decimal(
                    'total_amount',
                    15,
                    2
                )->default(0);

                $table->string(
                    'status',
                    20
                )->default('draft');

                $table->text(
                    'remarks'
                )->nullable();

                $table->timestamps();

                $table->index([
                    'sales_invoice_id',
                    'return_date',
                ]);

                $table->index([
                    'warehouse_id',
                    'return_date',
                ]);

                $table->index(
                    'status'
                );
            }
        );
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'sales_returns'
        );
    }
};