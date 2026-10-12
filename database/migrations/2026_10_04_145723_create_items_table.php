<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_type_id')->constrained('item_types')->cascadeOnDelete();
            $table->foreignId('item_category_id')->constrained('item_categories')->cascadeOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();

            $table->string('item_code')->unique();
            $table->string('name');
            $table->string('part_number')->nullable();
            $table->string('sku')->nullable()->unique();
            $table->string('barcode')->nullable()->unique();
            $table->text('description')->nullable();

            $table->decimal('minimum_stock', 14, 4)->nullable();
            $table->decimal('reorder_stock', 14, 4)->nullable();

            $table->string('status')->default('ACTIVE'); // ACTIVE / INACTIVE

            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};