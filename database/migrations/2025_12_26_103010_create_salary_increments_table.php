<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('salary_increments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->enum('increment_type', ['percentage', 'fixed']);
            $table->decimal('increment_value', 10, 2);   // 5 (% or amount)
            $table->decimal('increment_amount', 10, 2);  // calculated amount

            $table->decimal('old_basic_salary', 10, 2);
            $table->decimal('new_basic_salary', 10, 2);

            $table->date('effective_date');
            $table->enum('status', ['pending', 'approved', 'rejected'])
                  ->default('pending');

            $table->foreignId('approved_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salary_increments');
    }
};
