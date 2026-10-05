<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property string|null $attendance_status
 * @property string|null $checked_in_at
 * @property string|null $checked_out_at
 * @property string|null $type_of_leave
 * @property string|null $checked_in_at_note
 * @property string|null $checked_out_at_note
 * @property string $attendance_type
 * @property numeric|null $latitude
 * @property numeric|null $longitude
 * @property string|null $location_address
 * @property string $biometric_method
 * @property int|null $biometric_id
 * @property string|null $device_info
 * @property int|null $modification_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $modifyBy
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereAttendanceStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereAttendanceType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereBiometricId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereBiometricMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereCheckedInAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereCheckedInAtNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereCheckedOutAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereCheckedOutAtNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereDeviceInfo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereLatitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereLocationAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereLongitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereModificationBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereTypeOfLeave($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereUserId($value)
 * @mixin \Eloquent
 */
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