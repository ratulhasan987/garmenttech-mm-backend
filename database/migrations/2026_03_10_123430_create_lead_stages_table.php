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
        Schema::create('lead_stages', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // New, Visit, Negotiation, Won
            $table->string('pipeline_type')->nullable(); // sales | rental
            $table->string('project_type')->nullable();  // flat | land | commercial
            $table->unsignedTinyInteger('probability_percent')->default(0)->comment('0 - 100');
            $table->unsignedInteger('order')->default(1)->index(); // important for kanban sorting
            $table->string('color', 20)->nullable(); // hex or css class
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->boolean('is_convert_to_customer')
                ->default(false)
                ->comment('Automatically create customer when lead reaches this stage');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lead_stages');
    }
};
