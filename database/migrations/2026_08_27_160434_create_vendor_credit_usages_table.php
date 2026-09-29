<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vendor_credit_usages', function (Blueprint $table) {


            $table->id();



            $table->foreignId('vendor_credit_id')
                ->constrained()
                ->cascadeOnDelete();



            $table->foreignId('bill_id')
                ->constrained()
                ->cascadeOnDelete();



            $table->decimal(
                'amount',
                15,
                2
            );



            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();



            $table->timestamps();


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_credit_usages');
    }
};
