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
        Schema::create('salaries', function (Blueprint $table) {
$table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->onUpdate('cascade');
            $table->decimal('basic_salary', 10, 2)->default(0);
            $table->decimal('transport_allowance', 10, 2)->default(0);
            $table->decimal('family_allowance', 10, 2)->default(0);
            $table->decimal('others_allowance', 10, 2)->default(0);
            $table->decimal('overtime', 10, 2)->default(0);
            $table->decimal('gross_salary', 10, 2);

            $table->decimal('loan_deduction', 10, 2)->default(0);
            $table->decimal('salary_advance', 10, 2)->default(0);

            $table->decimal('state_tax', 10, 2)->default(0);
            $table->decimal('social_security', 10, 2)->default(0);

            // $table->decimal('total_absent', 10, 2)->default(0);
            $table->string('total_absent')->nullable();
            $table->decimal('absent_deduction', 10, 2)->default(0);

            $table->decimal('total_consecutive_late', 10, 2)->default(0);
            $table->decimal('consecutive_late_deduction', 10, 2)->default(0);

            $table->decimal('total_late_minutes', 10, 2)->default(0);
            $table->decimal('late_minutes_deduction', 10, 2)->default(0);

            $table->decimal('total_remaining_minutes', 10, 2)->default(0);
            $table->decimal('remaining_minutes_deduction', 10, 2)->default(0);

            $table->decimal('unpaid_leave', 10, 2)->default(0);
            $table->decimal('unpaid_leave_deduction', 10, 2)->default(0);

            $table->decimal('total_deductions', 10, 2)->default(0);

            $table->decimal('net_salary', 10, 2)->default(0);

            $table->enum('status', ['Approved', 'Hold'])->default('Hold');
            $table->string('month');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('cascade')->onUpdate('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salaries');
    }
};
