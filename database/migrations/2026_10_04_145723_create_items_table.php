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
        Schema::create('items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('item_category_id')->constrained('item_categories');

            $table->foreignId('brand_id')->nullable()->constrained('brands');

            $table->string('name')->unique();

            $table->string('part_number')->nullable();

            $table->string('sku')->nullable();

            $table->string('barcode')->nullable();

            $table->text('description')->nullable();

            $table->integer('minimum_stock')->nullable();

            $table->integer('reorder_stock')->nullable();

            $table->string('status')->default('active');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
