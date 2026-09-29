<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create(
            'stock_transfer_items',
            function (Blueprint $table) {
                $table->id();

                $table->foreignId(
                    'stock_transfer_id'
                )
                    ->constrained(
                        'stock_transfers'
                    )
                    ->cascadeOnUpdate()
                    ->cascadeOnDelete();

                /*
                |--------------------------------------------------------------------------
                | item_id = products.id
                |--------------------------------------------------------------------------
                */

                $table->unsignedBigInteger(
                    'item_id'
                );

                $table->string(
                    'unit'
                );

                $table->decimal(
                    'quantity',
                    15,
                    2
                );

                $table->timestamps();

                $table->index(
                    'item_id'
                );
            }
        );
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'stock_transfer_items'
        );
    }
};