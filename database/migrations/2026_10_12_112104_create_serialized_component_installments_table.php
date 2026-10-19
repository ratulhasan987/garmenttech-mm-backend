<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Clean up any partially created table from the failed attempt
        Schema::dropIfExists('serialized_component_installments');

        Schema::create('serialized_component_installments', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('machine_id')->constrained('machines')->cascadeOnDelete();
            
            // Define column normally
            $table->unsignedBigInteger('serialized_component_id');
            
            // Add foreign key with a SHORT custom name
            $table->foreign('serialized_component_id', 'sci_component_id_foreign')
                  ->references('id')
                  ->on('serialized_components')
                  ->cascadeOnDelete();

            $table->dateTime('installed_at');
            $table->dateTime('removed_at')->nullable();
            $table->foreignId('installed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('removed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('installation_reason')->nullable();
            $table->string('removal_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Add composite index with a SHORT custom name
            $table->index(['machine_id', 'serialized_component_id'], 'sci_machine_component_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('serialized_component_installments');
    }
};