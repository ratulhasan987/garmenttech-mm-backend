<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property numeric $amount
 * @property string $month
 * @property string $status
 * @property int|null $updated_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $updateBy
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance whereMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance whereUpdatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryAdvance whereUserId($value)
 * @mixin \Eloquent
 */
class SalaryAdvance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'amount',
        'month',
        'status',
        'updated_by',
    ];

    public function user()
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }

    public function updateBy()
    {
        return $this->belongsTo(
            User::class,
            'updated_by'
        );
    }
}