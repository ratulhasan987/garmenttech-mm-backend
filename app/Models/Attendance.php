<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'attendance_status',
        'checked_in_at',
        'checked_out_at',
        'type_of_leave',
        'checked_in_at_note',
        'checked_out_at_note',
        'modification_by',
        'attendance_type',
        'latitude',
        'longitude',
        'location_address',
        'biometric_method',
        'biometric_id',
        'device_info',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    public function user()
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }

    public function modifyBy()
    {
        return $this->belongsTo(
            User::class,
            'modification_by'
        );
    }
}