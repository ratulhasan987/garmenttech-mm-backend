<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('item_attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('items')->cascadeOnDelete();
            $table->foreignId('item_attribute_id')->constrained('item_attributes')->cascadeOnDelete();
            $table->foreignId('option_id')->nullable()->constrained('item_attribute_options')->nullOnDelete();

            $table->text('value_text')->nullable();
            $table->integer('value_integer')->nullable();
            $table->decimal('value_decimal', 16, 6)->nullable();
            $table->boolean('value_boolean')->nullable();
            $table->date('value_date')->nullable();

            $table->timestamps();
            $table->unique(['item_id', 'item_attribute_id']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('item_attribute_values');
    }
};