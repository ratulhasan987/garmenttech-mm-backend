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
        Schema::create('machine_locations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('machine_id')
                ->constrained('machines')
                ->cascadeOnDelete();

            $table->foreignId('floor_id')
                ->constrained('floors');

            $table->string('sl_no');

            $table->timestamp('assigned_at');

            $table->timestamp('removed_at')->nullable();

            $table->timestamps();

            $table->text('remarks')->nullable();

            $table->index(['machine_id', 'removed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('machine_locations');
    }
};
