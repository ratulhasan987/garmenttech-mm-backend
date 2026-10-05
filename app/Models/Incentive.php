<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property string $month
 * @property numeric $own_target
 * @property numeric $coordinator_target
 * @property numeric $total_target
 * @property numeric $achievement
 * @property numeric $amount
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereAchievement($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereCoordinatorTarget($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereOwnTarget($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereTotalTarget($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Incentive whereUserId($value)
 * @mixin \Eloquent
 */
class Incentive extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'month',
        'own_target',
        'coordinator_target',
        'total_target',
        'achievement',
        'amount',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
