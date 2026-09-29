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
        Schema::create('lead_followup_notifications', function (Blueprint $table) {

            $table->id();

            $table->unsignedBigInteger('lead_id')->index();
            $table->unsignedBigInteger('user_id')->index();

            $table->timestamp('notify_at')->index();
            $table->timestamp('read_at')->nullable();

            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lead_followup_notifications');
    }
};
