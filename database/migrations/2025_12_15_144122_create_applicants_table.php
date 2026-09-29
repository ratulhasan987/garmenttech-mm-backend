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

        Schema::create('applicants', function (Blueprint $table) {
            $table->id();

            $table->string('applicant_no', 50);
            $table->date('application_date');

            // Personal Information
            $table->string('applicant_image', 150)->nullable();
            $table->string('applicant_name_en', 150)->nullable();
            $table->string('applicant_name_bn', 150)->nullable();

            $table->string('father_name_en', 150)->nullable();
            $table->string('father_name_bn', 150)->nullable();

            $table->string('mother_name_en', 150)->nullable();
            $table->string('mother_name_bn', 150)->nullable();

            $table->text('mailling_address_en')->nullable();
            $table->text('mailling_address_bn')->nullable();

            $table->text('permanent_address_en')->nullable();
            $table->text('permanent_address_bn')->nullable();

            $table->string('personal_phone', 20)->nullable();
            $table->string('personal_email', 100)->nullable();
            $table->string('date_of_birth_or_age', 50)->nullable();
            $table->string('marital_status', 50)->nullable();
            $table->date('date_of_marriage')->nullable();
            $table->string('religion', 50)->nullable();
            $table->string('nationality', 50)->nullable();
            $table->string('passport_no', 50)->nullable();
            $table->string('national_id_no', 50)->nullable();
            $table->string('tin_no', 50)->nullable();

            // Joint applicants
            $table->string('client_name_one', 150)->nullable();
            $table->string('client_nid_one', 150)->nullable();

            $table->string('client_name_two', 150)->nullable();
            $table->string('client_nid_two', 150)->nullable();

            $table->string('client_name_three', 150)->nullable();
            $table->string('client_nid_three', 150)->nullable();

            // Nominee
            $table->string('nominee_image', 150)->nullable();
            $table->string('nominee_name', 150)->nullable();
            $table->string('relation_with_applicant', 100)->nullable();
            $table->text('nominee_address')->nullable();
            $table->string('nominee_age', 20)->nullable();
            $table->string('nominee_phone', 20)->nullable();
            $table->string('nominee_nid_no', 50)->nullable();

            // Occupation
            $table->enum('occupation', ['Business', 'Service', 'Others'])->nullable();
            $table->string('occupation_phone', 20)->nullable();
            $table->text('occupation_address')->nullable();

            // Plot Details
            $table->decimal('rate_per_katha', 15, 2)->nullable();
            $table->text('rate_per_katha_inword')->nullable();

            $table->decimal('total_price', 15, 2)->nullable();
            $table->text('total_price_inword')->nullable();

            $table->string('plot_no', 50)->nullable();
            $table->string('road_no', 50)->nullable();
            $table->string('block', 50)->nullable();
            $table->string('plot_area', 50)->nullable();
            $table->string('facing', 50)->nullable();
            $table->string('plot_size', 50)->nullable();

            // Bank / Cheque
            $table->string('bank_name', 100)->nullable();
            $table->string('branch', 100)->nullable();
            $table->date('cheque_date')->nullable();
            $table->string('cheque_po_dd_no', 100)->nullable();
            $table->decimal('amount', 15, 2)->nullable();

            // Payment
            $table->decimal('full_payment', 15, 2)->nullable();
            $table->decimal('booking_money', 15, 2)->nullable();
            $table->decimal('balance_amount', 15, 2)->nullable();
            $table->decimal('per_installment', 15, 2)->nullable();
            $table->integer('installment')->nullable();
            $table->decimal('down_payment', 15, 2)->nullable();
            $table->date('payment_date')->nullable();
            $table->date('installment_start_from')->nullable();
            $table->text('remarks')->nullable();

            // Seller
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('received_amount', 15, 2)->nullable();

            // Signatures
            $table->string('applicant_signature', 150)->nullable();
            $table->string('joint_applicant_signature', 150)->nullable();
            $table->string('authorized_signature', 150)->nullable();
            $table->date('authorized_sig_date')->nullable();
            $table->string('sales_officer_signature', 150)->nullable();
            $table->string('group_leader_signature', 150)->nullable();
            $table->string('head_of_sales_signature', 150)->nullable();

            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applicants');
    }
};
