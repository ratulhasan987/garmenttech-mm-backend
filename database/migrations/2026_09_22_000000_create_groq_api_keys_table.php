<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('groq_api_keys', function (Blueprint $table) {
            $table->id();
            $table->text('key');
            $table->string('fingerprint', 64)->unique();
            $table->string('last_four', 4);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('groq_api_keys');
    }
};
