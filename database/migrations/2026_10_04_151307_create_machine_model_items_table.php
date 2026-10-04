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
        Schema::create('machine_model_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('machine_model_id')->constrained('machine_models');

            $table->foreignId('item_id')->constrained('items');

            $table->enum('relationship_type', ['REQUIRED_PART', 'OPTIONAL_PART', 'CONSUMABLE', 'LUBRICANT', 'ACCESSORY', 'TOOL', 'EQUIPMENT']);

            $table->integer('quantity_required');

            $table->boolean('is_critical')->default(false);

            $table->boolean('is_recommended')->default(false);

            $table->string('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('machine_model_items');
    }
};
