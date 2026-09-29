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
        Schema::create('financial_statement_mappings', function (Blueprint $table) {
            $table->id();
            $table->enum('statement_type', ['income_statement','balance_sheet','cash_flow']);
            $table->foreignId('account_id')->constrained('chart_of_accounts');
            $table->string('section');
            $table->string('sub_section')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_statement_mappings');
    }
};
