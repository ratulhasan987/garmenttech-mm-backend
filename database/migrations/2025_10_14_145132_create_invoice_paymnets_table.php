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
        Schema::create('invoice_payments', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_no')->nullable();
            $table->foreignId('invoice_id')->constrained('invoices')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('invoice_payment_configure_id')->constrained('invoice_payment_configures')->onDelete('cascade')->onUpdate('cascade');
            $table->timestamp('date')->useCurrent()->change();
            $table->decimal('pay_amount', 15, 2)->nullable();
            $table->enum('payment_method', ['Cash', 'DD', 'PO', 'Cheque'])->nullable();
            $table->string('bank_name')->nullable();
            $table->string('branch')->nullable();
            $table->foreignId('account_id')->nullable()->constrained('chart_of_accounts');
            $table->string('reference')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->text('description')->nullable();
            $table->string('attachment')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_payments');
    }
};
