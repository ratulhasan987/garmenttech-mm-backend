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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->onUpdate('cascade');
            $table->string('resume')->nullable();
            $table->string('nid_card')->nullable();
            $table->string('as_per_nid_image')->nullable();
            $table->string('father_nid')->nullable();
            $table->string('mother_nid')->nullable();
            $table->string('relative_nid_primary')->nullable();
            $table->string('relative_nid_secondary')->nullable();
            $table->string('non_relative_nid_primary')->nullable();
            $table->string('non_relative_nid_secondary')->nullable();
            $table->text('educational_certificate')->nullable();
            $table->text('professional_certificate')->nullable();
            $table->text('training_certificate')->nullable();

            $table->string('professional_referance_primary')->nullable();
            $table->string('professional_referance_secondary')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
