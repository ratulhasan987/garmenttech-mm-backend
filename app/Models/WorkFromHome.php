<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property string $start_date
 * @property string $end_date
 * @property numeric $days
 * @property string $status
 * @property string|null $reason
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome whereDays($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkFromHome whereUserId($value)
 * @mixin \Eloquent
 */
class WorkFromHome extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'start_date',
        'end_date',
        'days',
        'status',
        'reason',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}