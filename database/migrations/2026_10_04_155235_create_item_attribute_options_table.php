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
        Schema::create('item_attribute_options', function (Blueprint $table) {
            $table->id();

            $table->foreignId('item_attribute_id')->constrained('item_attributes');

            $table->string('value');

            $table->string('label')->nullable();
            $table->smallInteger('sort_order')->default(0);

            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_attribute_options');
    }
};
