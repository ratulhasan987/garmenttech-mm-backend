<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('inventory_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('items')->cascadeOnDelete();
            $table->string('unit')->nullable();
            $table->decimal('quantity', 16, 4)->default(0);
            $table->decimal('reserved_quantity', 16, 4)->default(0);
            $table->timestamps();
            $table->unique('item_id');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('inventory_stocks');
    }
};