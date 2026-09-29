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
        Schema::create('clients', function (Blueprint $table) {
            $table->id();

            // Customer Information
            $table->string('client_no')->unique();
            $table->string('name');
            $table->string('phone', 20)->unique()->index();
            $table->string('email')->nullable()->unique();

            // Identity
            $table->string('nid_no')->nullable()->index();
            $table->string('passport_no')->nullable();
            $table->string('tin_no')->nullable();

            // Personal Information
            $table->date('date_of_birth')->nullable();

            $table->enum('gender', [
                'male',
                'female',
                'other'
            ])->nullable();

            $table->enum('marital_status', [
                'single',
                'married',
                'divorced',
                'widowed'
            ])->nullable();

            // Occupation
            $table->unsignedBigInteger('profession_id')->nullable();

            $table->unsignedBigInteger('lead_designation_id')->nullable();

            $table->string('company_name')->nullable();

            // Address
            $table->text('present_address')->nullable();
            $table->text('permanent_address')->nullable();

            $table->unsignedBigInteger('area_id')->nullable();

            $table->unsignedBigInteger('sector_id')->nullable();

            // Customer Profile
            $table->string('image')->nullable();

            $table->enum('status', [
                'active',
                'inactive'
            ])->default('active');

            // CRM Reference
            $table->unsignedBigInteger('lead_id')->nullable();

            // Audit
            $table->unsignedBigInteger('created_by')->nullable();

            $table->unsignedBigInteger('updated_by')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
