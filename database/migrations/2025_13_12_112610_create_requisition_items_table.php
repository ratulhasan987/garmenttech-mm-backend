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
        Schema::create('requisition_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requisition_id')->constrained('requisitions')->onDelete('cascade')->onUpdate('cascade');


            $table->foreignId('product_id')
                ->constrained('products')
                ->restrictOnDelete()
                ->cascadeOnUpdate();


            $table->decimal('previously_requisitioned', 15, 2)->default(0); // cumulative
            $table->decimal('remaining_quantity', 15, 2)->nullable();
            $table->decimal('quantity', 15, 2);

            $table->unsignedBigInteger('item_id');
            $table->string('unit');
            $table->date('required_date')->nullable();
            $table->enum('priority', ['Low', 'Medium', 'High'])->default('Medium');
            $table->enum('status', ['Pending', 'Approved', 'Procured', 'Rejected'])->default('Pending');
            $table->timestamps();


            $table->index([
                'requisition_id',
                'product_id',
            ]);

            $table->index(
                'product_id'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requisition_items');
    }
};
