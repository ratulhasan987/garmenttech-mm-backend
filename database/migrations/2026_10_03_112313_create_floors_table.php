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
        Schema::create('floors', function (Blueprint $table) {
            $table->id();

            $table->foreignId('building_id')
                ->constrained('buildings')
                ->cascadeOnDelete();

            $table->string('name');

            $table->integer('floor_number');

            $table->string('code')->unique();

            $table->text('description')->nullable();

            $table->integer('line_amount')->default(0);
            $table->integer('max_machine_per_line')->default(0);

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->unique(['building_id', 'floor_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('floors');
    }
};
