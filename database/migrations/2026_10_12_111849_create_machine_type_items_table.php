<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('machine_type_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('machine_type_id')->constrained('machine_models')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('items')->cascadeOnDelete();

            $table->string('relationship_type'); // REQUIRED_PART, OPTIONAL_PART, CONSUMABLE, LUBRICANT, ACCESSORY, TOOL, EQUIPMENT
            $table->decimal('quantity_required', 14, 4)->nullable();
            $table->boolean('is_critical')->default(false);
            $table->boolean('is_recommended')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['machine_type_id', 'item_id']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('machine_type_items');
    }
};