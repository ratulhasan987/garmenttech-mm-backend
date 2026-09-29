<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table(
            'sales_invoice_items',
            function (
                Blueprint $table
            ) {
                $table
                    ->json('tax_ids')
                    ->nullable()
                    ->after('tax');
            }
        );
    }

    public function down(): void
    {
        Schema::table(
            'sales_invoice_items',
            function (
                Blueprint $table
            ) {
                $table->dropColumn(
                    'tax_ids'
                );
            }
        );
    }
};