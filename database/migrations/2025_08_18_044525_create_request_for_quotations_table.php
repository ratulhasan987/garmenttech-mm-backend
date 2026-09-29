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
        Schema::create('request_for_quotations', function (Blueprint $table) {
            $table->id();
            $table->string('rfq_no')->unique(); // RFQ-202600001


            $table->foreignId('requisition_id')
                ->nullable()
                ->constrained('requisitions')
                ->nullOnDelete();

            $table->boolean('is_requisition_based')->default(true);

            $table->foreignId('vendor_id')
                ->constrained('vendors')
                ->restrictOnDelete();

            $table->date('required_date')->nullable();
            $table->date('submitted_date')->nullable(); // vendor quote date

            $table->enum('status', [
                'Draft',
                'Pending',   // submitted for approval
                'Approved',
                'Rejected',
                'Cancelled',
            ])->default('Draft');

            $table->text('notes')->nullable();

            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();

            $table->timestamps();

            $table->index(['requisition_id', 'status']);
            $table->index(['vendor_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_for_quotations');
    }
};
