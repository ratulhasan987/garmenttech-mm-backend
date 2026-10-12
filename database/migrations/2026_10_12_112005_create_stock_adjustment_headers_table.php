<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('stock_adjustment_headers', function (Blueprint $table) {
            $table->id();
            $table->string('adjustment_id')->unique();
            $table->foreignId('adjusted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('adjustment_date');
            $table->string('reason');
            $table->text('note')->nullable();
            $table->string('status')->default('DRAFT'); // DRAFT, PENDING_APPROVAL, APPROVED, POSTED, REJECTED, CANCELLED
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('stock_adjustment_headers');
    }
};