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
        Schema::create('vendor_refunds', function (Blueprint $table) {


            $table->id();



            $table->string(
                'refund_no'
            )
                ->unique();



            $table->foreignId('vendor_id')
                ->constrained()
                ->cascadeOnDelete();



            $table->foreignId('vendor_credit_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();



            $table->decimal(
                'amount',
                15,
                2
            );



            $table->date(
                'refund_date'
            );



            $table->unsignedBigInteger(
                'account_id'
            )
                ->nullable();



            $table->string(
                'reference'
            )
                ->nullable();



            $table->text(
                'note'
            )
                ->nullable();



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
        Schema::dropIfExists('vendor_refunds');
    }
};
