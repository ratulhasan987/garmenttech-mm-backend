<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();

            $table
                ->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->enum(
                'attendance_status',
                [
                    'present',
                    'absent',
                    'home',
                    'leave',
                    'dayof',
                ]
            )->nullable();

            $table
                ->string('checked_in_at')
                ->nullable();

            $table
                ->string('checked_out_at')
                ->nullable();

            $table
                ->string('type_of_leave')
                ->nullable();

            $table
                ->string('checked_in_at_note')
                ->nullable();

            $table
                ->string('checked_out_at_note')
                ->nullable();

            $table
                ->enum(
                    'attendance_type',
                    [
                        'ip',
                        'location',
                        'device',
                    ]
                )
                ->default('ip');

            $table
                ->decimal(
                    'latitude',
                    10,
                    7
                )
                ->nullable();

            $table
                ->decimal(
                    'longitude',
                    10,
                    7
                )
                ->nullable();

            $table
                ->string('location_address')
                ->nullable();

            $table
                ->enum(
                    'biometric_method',
                    [
                        'none',
                        'fingerprint',
                        'face',
                    ]
                )
                ->default('none');

            $table
                ->unsignedBigInteger('biometric_id')
                ->nullable();

            $table
                ->string('device_info')
                ->nullable();

            $table
                ->foreignId('modification_by')
                ->nullable()
                ->constrained(
                    'users'
                )
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->timestamps();

            $table->index([
                'user_id',
                'created_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'attendances'
        );
    }
};