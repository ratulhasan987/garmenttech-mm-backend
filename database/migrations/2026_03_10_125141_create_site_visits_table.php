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
        Schema::create('site_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable();
            $table->dateTime('scheduled_at');
            $table->dateTime('visit_date')->nullable();
            $table->string('visit_status')->default('scheduled');
            $table->foreignId('accompanied_by')->nullable()->constrained('users');
            $table->boolean('transport_provided')->default(false);
            $table->integer('feedback_rating')->nullable();
            $table->string('interest_level')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_visits');
    }
};
