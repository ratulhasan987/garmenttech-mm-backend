<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bill_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('bill_id')
                ->constrained('bills')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('goods_received_note_item_id')
                ->constrained('goods_received_note_items')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('purchase_item_id')
                ->constrained('purchase_items')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            /*
            |--------------------------------------------------------------------------
            | item_id = products.id
            |--------------------------------------------------------------------------
            */

            $table->unsignedBigInteger('item_id');

            $table->string('unit')->nullable();

            $table->decimal('quantity', 15, 2);

            $table->decimal('unit_price', 15, 2);

            $table->decimal('discount', 15, 2)
                ->default(0);

            /*
            |--------------------------------------------------------------------------
            | Tax snapshot copied from PO
            |--------------------------------------------------------------------------
            */

            $table->json('taxes')->nullable();

            $table->decimal('total_tax', 15, 2)
                ->default(0);

            $table->decimal('total_amount', 15, 2)
                ->default(0);

            $table->timestamps();

            $table->index('item_id');
            $table->index('purchase_item_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bill_items');
    }
};
