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
        Schema::create('ledgers', function (Blueprint $table) {
            $table->id();


            $table->enum(
                'party_type',
                [
                    'Vendor',
                    'Customer'
                ]
            );


            $table->unsignedBigInteger(
                'party_id'
            );


            $table->string(
                'transaction_type'
            );


            $table->unsignedBigInteger(
                'transaction_id'
            );


            $table->date('date');


            $table->decimal(
                'amount',
                15,
                2
            );


            $table->enum(
                'nature',
                [
                    'increase',
                    'decrease'
                ]
            );


            $table->text('note')
                ->nullable();


            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ledgers');
    }
};
