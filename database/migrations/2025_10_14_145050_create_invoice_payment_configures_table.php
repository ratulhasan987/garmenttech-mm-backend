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
        Schema::create('invoice_payment_configures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->onDelete('cascade')->onUpdate('cascade');
            $table->enum('type', ['Token', 'Booking', 'Registration', 'Installment', 'Down-Payment']);
            $table->decimal('number_of_installment', 15, 2)->nullable();
            $table->decimal('amount', 15, 2)->nullable();
            $table->decimal('paid_amount', 15, 2)->nullable();
            $table->decimal('percentage', 5, 2)->nullable();
            $table->enum('installment_type', ['Monthly', 'Quarterly', 'Half_Yearly'])->nullable();
            $table->string('payment_day')->nullable();
            $table->string('start_month')->nullable();
            $table->string('end_month')->nullable();
            $table->date('due_date')->nullable();
            $table->decimal('late_fee', 15, 2)->nullable();
            $table->unsignedInteger('sequence')->nullable();
            $table->text('remarks')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->enum('status', ['In-complete', 'Completed', 'In-progress'])->default('In-complete');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_payment_configures');
    }
};
