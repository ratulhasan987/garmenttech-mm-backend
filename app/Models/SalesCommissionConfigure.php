<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property string $commission_type
 * @property numeric|null $commission_rate
 * @property string|null $note
 * @property string $status
 * @property int $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User $createdBy
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure whereCommissionRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure whereCommissionType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesCommissionConfigure whereUserId($value)
 * @mixin \Eloquent
 */
class SalesCommissionConfigure extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'commission_type',
        'commission_rate',
        'note',
        'status',
        'created_by'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
