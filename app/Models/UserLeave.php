<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property int $leave_id
 * @property string|null $start_date
 * @property string|null $end_date
 * @property int $remaining_days
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Leave> $leaves
 * @property-read int|null $leaves_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave whereLeaveId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave whereRemainingDays($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserLeave whereUserId($value)
 * @mixin \Eloquent
 */
class UserLeave extends Model
{
    use HasFactory;

    // Table name
    protected $table = 'user_leave';

    // Fillable fields
    protected $fillable = [
        'user_id',
        'leave_id',
        'start_date',
        'end_date',
        'remaining_days',
    ];

    // User Model
    public function leaves()
    {
        return $this->belongsToMany(Leave::class, 'user_leave');
    }

    // Leave Model
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_leave');
    }

}
