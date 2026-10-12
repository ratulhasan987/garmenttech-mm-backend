<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('item_attributes', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('code')->unique();

            $table->enum('data_type', ['TEXT', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'DATE', 'OPTION']);

            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->text('description')->nullable();

            $table->boolean('is_required')->default(false);

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_attributes');
    }
};
