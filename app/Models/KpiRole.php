<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property numeric $incentive
 * @property numeric|null $coordination_incentive
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KpiRole newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KpiRole newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KpiRole query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KpiRole whereCoordinationIncentive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KpiRole whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KpiRole whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KpiRole whereIncentive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KpiRole whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KpiRole whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class KpiRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'incentive',
        'coordination_incentive',
    ];
}
