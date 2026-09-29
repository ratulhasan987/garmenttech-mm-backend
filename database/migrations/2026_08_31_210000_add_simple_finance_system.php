<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounts_payables', function (Blueprint $table) {
            $table->foreignId('bill_id')->nullable()->unique()->after('id')->constrained('bills')->cascadeOnUpdate()->restrictOnDelete();
            $table->renameColumn('invoice_no', 'document_no');
            $table->renameColumn('invoice_date', 'document_date');
        });

        Schema::table('accounts_receivables', function (Blueprint $table) {
            $table->unsignedBigInteger('client_id')->nullable()->change();
            $table->foreignId('vendor_id')->nullable()->after('client_id')->constrained('vendors')->restrictOnDelete();
            $table->string('source_type', 40)->after('vendor_id');
            $table->unsignedBigInteger('source_id')->after('source_type');
            $table->renameColumn('invoice_no', 'document_no');
            $table->renameColumn('invoice_date', 'document_date');
            $table->unique(['source_type', 'source_id']);
        });

        Schema::create('vendor_debit_notes', function (Blueprint $table) {
            $table->id();
            $table->string('debit_note_no')->unique();
            $table->foreignId('purchase_return_id')->unique()->constrained('purchase_returns')->restrictOnDelete();
            $table->foreignId('vendor_id')->constrained('vendors')->restrictOnDelete();
            $table->date('debit_note_date');
            $table->date('due_date');
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2)->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('finance_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_no')->unique();
            $table->date('transaction_date');
            $table->enum('direction', ['inflow', 'outflow']);
            $table->string('transaction_type', 40);
            $table->foreignId('accounts_receivable_id')->nullable()->constrained('accounts_receivables')->restrictOnDelete();
            $table->foreignId('accounts_payable_id')->nullable()->constrained('accounts_payables')->restrictOnDelete();
            $table->foreignId('sales_return_id')->nullable()->constrained('sales_returns')->restrictOnDelete();
            $table->string('party_type', 20);
            $table->unsignedBigInteger('party_id');
            $table->nullableMorphs('payment');
            $table->decimal('amount', 15, 2);
            $table->string('payment_method', 30)->nullable();
            $table->string('reference')->nullable();
            $table->text('remarks')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['transaction_date', 'direction']);
            $table->index(['party_type', 'party_id']);
            $table->unique(['payment_type', 'payment_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('finance_transactions');
        Schema::dropIfExists('vendor_debit_notes');

        Schema::table('accounts_receivables', function (Blueprint $table) {
            $table->dropUnique(['source_type', 'source_id']);
            $table->dropConstrainedForeignId('vendor_id');
            $table->dropColumn(['source_type', 'source_id']);
            $table->renameColumn('document_no', 'invoice_no');
            $table->renameColumn('document_date', 'invoice_date');
        });

        Schema::table('accounts_payables', function (Blueprint $table) {
            $table->dropConstrainedForeignId('bill_id');
            $table->renameColumn('document_no', 'invoice_no');
            $table->renameColumn('document_date', 'invoice_date');
        });
    }
};
