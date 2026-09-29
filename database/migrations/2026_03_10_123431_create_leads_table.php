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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();

            $table->string('lead_code');
            $table->string('name')->nullable();
            $table->string('company_name')->nullable();
            $table->string('phone', 20)->index();
            $table->string('phone_secondary', 20)->nullable()->index();
            $table->string('phone_foreign', 20)->nullable()->index();
            $table->string('email')->nullable();

            $table->foreignId('area_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('sector_id')->nullable()->constrained()->nullOnDelete();

            $table->foreignId('profession_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('designation_id')->nullable()->constrained('lead_designations')->nullOnDelete();

            $table->foreignId('source_id')->nullable()->constrained('lead_sources')->nullOnDelete();

            $table->foreignId('stage_id')->constrained('lead_stages');

            $table->foreignId('assigned_to')->nullable()->index();

            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->enum('interest_level', ['cold', 'warm', 'hot'])->nullable();

            /* Follow-up & Sales Control */
            $table->timestamp('last_contacted_at')->nullable();
            $table->timestamp('next_follow_up_at')->nullable();
            $table->text('remarks')->nullable();

            /* Conversion Tracking */
            $table->boolean('is_converted')->default(false);
            $table->timestamp('converted_at')->nullable();
            $table->unsignedBigInteger('customer_id')->nullable();

            $table->text('address')->nullable();

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
        Schema::dropIfExists('leads');
    }
};
