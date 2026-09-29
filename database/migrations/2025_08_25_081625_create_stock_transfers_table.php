<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(
            'stock_transfers',
            function (Blueprint $table) {
                $table->id();

                $table->string(
                    'stock_transfer_id'
                )->unique();

                $table->foreignId(
                    'from_warehouse_id'
                )
                    ->constrained(
                        'warehouses'
                    )
                    ->restrictOnDelete();

                $table->foreignId(
                    'to_warehouse_id'
                )
                    ->constrained(
                        'warehouses'
                    )
                    ->restrictOnDelete();

                $table->foreignId(
                    'transferred_by'
                )
                    ->constrained(
                        'users'
                    );

                $table->date(
                    'transfer_date'
                );

                $table->decimal(
                    'transportation_cost',
                    15,
                    2
                )->nullable();

                /*
                |--------------------------------------------------------------------------
                | No unit_price in transfer items anymore.
                |
                | Therefore grand_total currently represents transfer-level
                | cost only, i.e. transportation cost.
                |--------------------------------------------------------------------------
                */

                $table->decimal(
                    'grand_total',
                    15,
                    2
                )->default(0);

                $table->text(
                    'note'
                )->nullable();

                $table->enum(
                    'status',
                    [
                        'Pending',
                        'Posted',
                    ]
                )->default(
                    'Pending'
                );

                $table->timestamps();

                $table->index(
                    'transfer_date'
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
            'stock_transfers'
        );
    }
};