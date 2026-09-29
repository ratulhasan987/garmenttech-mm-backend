<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        Schema::create('stock_adjustment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_adjustment_id')->constrained('stock_adjustments')->cascadeOnUpdate()->cascadeOnDelete();
            $table->unsignedBigInteger('item_id'); // products.id
            $table->string('unit', 50)->nullable();
            $table->enum('adjustment_type', ['increase', 'decrease']);
            $table->decimal('quantity', 15, 2);
            $table->timestamps();
            $table->index('item_id');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('stock_adjustment_items');
    }
};
