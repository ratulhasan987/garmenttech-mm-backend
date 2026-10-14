<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('attributes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['text', 'number', 'boolean', 'select'])->default('text');
            $table->json('options')->nullable(); // Stores options as a JSON array if type is 'select'
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attributes');
    }
};