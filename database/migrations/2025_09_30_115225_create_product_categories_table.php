<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_categories', function (Blueprint $table) {
            $table->id();

            $table->string('name');

            /*
            |--------------------------------------------------------------------------
            | Category Hierarchy
            |--------------------------------------------------------------------------
            |
            | parent_id = NULL
            |     Main Category
            |
            | parent_id = category ID
            |     Subcategory
            |
            */

            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('product_categories')
                ->nullOnDelete();

            $table->timestamps();

            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_categories');
    }
};