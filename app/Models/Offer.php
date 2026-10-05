<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $lead_id
 * @property int $unit_id
 * @property numeric $offered_price
 * @property numeric|null $discount_percent
 * @property int|null $approved_by
 * @property string $status
 * @property string|null $remarks
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Lead $lead
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereDiscountPercent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereOfferedPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereUnitId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Offer whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Offer extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'unit_id',
        'offered_price',
        'discount_percent',
        'approved_by',
        'status',
        'remarks'
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
