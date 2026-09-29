<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Convert Existing Data
        |--------------------------------------------------------------------------
        */

        DB::table('sales_invoices')
            ->where('status', 'draft')
            ->update([
                'status' => 'Pending',
            ]);

        DB::table('sales_invoices')
            ->where('status', 'posted')
            ->update([
                'status' => 'Approved',
            ]);

        DB::table('sales_invoices')
            ->where('status', 'cancelled')
            ->update([
                'status' => 'Rejected',
            ]);

        /*
        |--------------------------------------------------------------------------
        | New Default
        |--------------------------------------------------------------------------
        */

        Schema::table(
            'sales_invoices',
            function (
                Blueprint $table
            ) {
                $table
                    ->string(
                        'status',
                        20
                    )
                    ->default(
                        'Pending'
                    )
                    ->change();
            }
        );
    }

    public function down(): void
    {
        DB::table('sales_invoices')
            ->where('status', 'Pending')
            ->update([
                'status' => 'draft',
            ]);

        DB::table('sales_invoices')
            ->where('status', 'Approved')
            ->update([
                'status' => 'posted',
            ]);

        DB::table('sales_invoices')
            ->where('status', 'Rejected')
            ->update([
                'status' => 'cancelled',
            ]);

        Schema::table(
            'sales_invoices',
            function (
                Blueprint $table
            ) {
                $table
                    ->string(
                        'status',
                        20
                    )
                    ->default(
                        'draft'
                    )
                    ->change();
            }
        );
    }
};