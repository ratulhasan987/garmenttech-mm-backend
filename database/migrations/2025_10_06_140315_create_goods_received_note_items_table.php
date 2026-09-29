<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('goods_received_note_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('goods_received_note_id')
                ->constrained('goods_received_notes')
                ->cascadeOnDelete()
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

            $table->string('unit', 50);

            /*
            |--------------------------------------------------------------------------
            | Actual received quantity
            |--------------------------------------------------------------------------
            */

            $table->decimal('quantity', 15, 2);

            $table->timestamps();

            $table->index('item_id');
            $table->index('purchase_item_id');

            /*
            |--------------------------------------------------------------------------
            | One PO line can appear once inside a single GRN
            |--------------------------------------------------------------------------
            */

            $table->unique(
                [
                    'goods_received_note_id',
                    'purchase_item_id',
                ],
                'grn_purchase_item_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goods_received_note_items');
    }
};
