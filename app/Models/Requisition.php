<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $requisition_id
 * @property string $required_date
 * @property int $requested_by
 * @property string|null $attachments
 * @property string $status
 * @property int|null $approved_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $approvedBy
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\RequisitionItem> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\User $requestedBy
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition whereAttachments($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition whereRequestedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition whereRequiredDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition whereRequisitionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Requisition whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Requisition extends Model
{
    use HasFactory;

    protected $fillable = [
        'requisition_id',
        'required_date',
        'requested_by',
        'status',
        'attachments',
        'approved_by',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function items()
    {
        return $this->hasMany(
            RequisitionItem::class,
            'requisition_id'
        );
    }

    public function requestedBy()
    {
        return $this->belongsTo(
            User::class,
            'requested_by'
        );
    }

    public function approvedBy()
    {
        return $this->belongsTo(
            User::class,
            'approved_by'
        );
    }

}
