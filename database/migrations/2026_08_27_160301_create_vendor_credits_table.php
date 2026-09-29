<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void
    {
        Schema::create('vendor_credits', function (Blueprint $table) {

            $table->id();


            $table->string('credit_no')
                ->unique();



            $table->foreignId('vendor_id')
                ->constrained('vendors')
                ->cascadeOnDelete();



            $table->foreignId('purchase_return_id')
                ->nullable()
                ->constrained('purchase_returns')
                ->nullOnDelete();



            $table->decimal(
                'amount',
                15,
                2
            );



            $table->decimal(
                'used_amount',
                15,
                2
            )
            ->default(0);



            $table->decimal(
                'remaining_amount',
                15,
                2
            );



            $table->enum(
                'status',
                [
                    'Open',
                    'Partial',
                    'Used',
                    'Cancelled'
                ]
            )
            ->default('Open');



            $table->text('note')
                ->nullable();



            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();



            $table->timestamps();

        });
    }



    public function down(): void
    {
        Schema::dropIfExists(
            'vendor_credits'
        );
    }

};