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
        Schema::create('lead_conversations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('lead_id')->constrained('leads')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();

            $table->enum('channel', ['call','whatsapp','email','sms','meeting','note']);
            $table->text('message')->nullable();

            $table->enum('call_direction', ['inbound','outbound'])->nullable();
            $table->integer('call_duration')->nullable();

            $table->boolean('requires_follow_up')->default(false);
            $table->timestamp('next_follow_up_at')->nullable();

            $table->foreignId('stage_id')->nullable()->constrained('lead_stages')->nullOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lead_conversations');
    }
};
