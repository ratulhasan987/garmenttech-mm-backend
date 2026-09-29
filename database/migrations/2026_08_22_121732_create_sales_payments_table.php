<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(
            'sales_payments',
            function (Blueprint $table) {
                $table->id();

                $table->string(
                    'payment_no'
                )->unique();

                $table->foreignId(
                    'sales_invoice_id'
                )
                    ->constrained(
                        'sales_invoices'
                    )
                    ->restrictOnDelete();

                $table->date(
                    'payment_date'
                );

                $table->decimal(
                    'amount',
                    15,
                    2
                );

                $table->enum(
                    'status',
                    [
                        'Pending',
                        'Approved',
                        'Rejected',
                    ]
                )->default('Pending');

                $table->foreignId(
                    'approved_by'
                )
                    ->nullable()
                    ->constrained(
                        'users'
                    )
                    ->nullOnDelete();

                $table->timestamp(
                    'approved_at'
                )->nullable();

                $table->string(
                    'payment_method',
                    30
                );

                $table->string(
                    'reference'
                )->nullable();

                $table->text(
                    'remarks'
                )->nullable();

                $table->timestamps();

                $table->index([
                    'sales_invoice_id',
                    'payment_date',
                ]);

                $table->index(
                    'payment_method'
                );

                $table->index(
                    'status'
                );
            }
        );
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'sales_payments'
        );
    }
};