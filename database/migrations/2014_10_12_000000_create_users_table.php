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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('department_id')->nullable();
            $table->unsignedBigInteger('designation_id')->nullable();
            $table->unsignedBigInteger('reporting_officer')->nullable();
            $table->string('employee_id')->nullable()->uniqid();
            $table->string('role');
            $table->decimal('account_balance', 10, 2)->nullable()->default(0);
            $table->integer('working_hours')->default(8);
            $table->string('name');
            $table->string('email')->unique();
            $table->string('image')->nullable();
            $table->unsignedBigInteger('shift_id')->nullable();
            $table->string('language')->nullable();
            $table->string('phone')->nullable();
            $table->string('mobile')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->string('national_id')->nullable();
            $table->enum('pay_frequency', ['Monthly', 'Weekly', 'Yearly'])->default('Monthly');
            $table->enum('gender', ['Male', 'Female', 'Others'])->nullable();
            $table->enum('marital_status', ['Single', 'Married', 'Divorced'])->nullable();
            $table->string('blood_group')->nullable();
            $table->string('health_condition')->nullable();
            $table->date('joining_date')->nullable();
            $table->date('probation_period_end_date')->nullable();
            $table->string('address')->nullable();

            // Bank Informations
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('branch_address')->nullable();
            $table->string('tin_number')->nullable();
            $table->string('basic_salary')->nullable();
            $table->string('transport_allowance')->nullable();
            $table->string('family_allowance')->nullable();
            $table->string('others_allowance')->nullable();
            $table->string('gross_salary')->nullable();

            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->enum('attendance_type', ['ip', 'location', 'device'])->default('ip');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->timestamp('last_login_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('sessions');

    }
};
