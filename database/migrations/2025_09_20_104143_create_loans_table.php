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
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->onUpdate('cascade');
            $table->text('loan_details');
            $table->decimal('amount', 10, 2);
            $table->integer('duration'); // in months
            $table->decimal('monthly_installment', 10, 2);
            $table->enum('status', ['Pending', 'Approved', 'Rejected', 'Active', 'Completed'])->default('Pending');
            $table->date('approval_date')->nullable();
            $table->string('repayment_from')->nullable();
            $table->decimal('interest', 10, 2)->nullable(); // Percentage(%)
            $table->string('repayment_amount')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
