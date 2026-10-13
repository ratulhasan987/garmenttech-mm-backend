<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('items')->cascadeOnDelete();
            $table->string('unit')->nullable();
            $table->decimal('quantity', 16, 4);
            $table->decimal('balance_before', 16, 4)->default(0);
            $table->decimal('balance_after', 16, 4)->default(0);
            $table->string('transaction_type');
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['item_id', 'created_at']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
    }
};


// 2025_09_16_045754_create_inventory_transactions_table.php