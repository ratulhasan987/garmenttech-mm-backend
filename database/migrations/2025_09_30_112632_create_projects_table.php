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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('project_no')->unique();
            $table->string('name')->unique();
            $table->decimal('price_per_unit', 15, 2)->nullable();
            $table->decimal('purchase_price', 15, 2)->nullable();
            $table->foreignId('unit_id')->nullable()->constrained('units')->onDelete('set null');
            $table->decimal('size', 15, 2)->nullable();
            $table->text('taxes')->nullable();
            $table->string('location')->nullable();
            $table->string('address')->nullable();
            $table->enum('status', ['Active', 'In-active'])->default('Active');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
