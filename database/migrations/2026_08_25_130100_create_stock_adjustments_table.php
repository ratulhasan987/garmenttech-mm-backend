<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->id();
            $table->string('adjustment_id')->unique();
            $table->foreignId('warehouse_id')->constrained('warehouses')->restrictOnDelete();
            $table->foreignId('adjusted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('adjustment_date');
            $table->string('reason')->nullable();
            $table->text('note')->nullable();
            $table->enum('status', ['draft', 'posted'])->default('draft');
            $table->timestamps();
            $table->index('adjustment_date');
            $table->index('status');
        });
    }
    public function down(): void { Schema::dropIfExists('stock_adjustments'); }
};
