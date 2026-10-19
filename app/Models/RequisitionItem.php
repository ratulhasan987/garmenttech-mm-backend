<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $requisition_id
 * @property int $product_id
 * @property numeric $previously_requisitioned
 * @property numeric|null $remaining_quantity
 * @property numeric $quantity
 * @property int $item_id
 * @property string $unit
 * @property \Carbon\CarbonImmutable|null $required_date
 * @property string $priority
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Product $product
 * @property-read \App\Models\Requisition $requisition
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem wherePreviouslyRequisitioned($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem wherePriority($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereRemainingQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereRequiredDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereRequisitionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|RequisitionItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class RequisitionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'requisition_id',
        'product_id',
        'previously_requisitioned',
        'remaining_quantity',
        'quantity',
        'item_id',
        'unit',
        'required_date',
        'priority',
        'status',
    ];

    protected $casts = [
        'previously_requisitioned' => 'decimal:2',
        'remaining_quantity' => 'decimal:2',
        'quantity' => 'decimal:2',
        'required_date' => 'date',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function requisition()
    {
        return $this->belongsTo(
            Requisition::class,
            'requisition_id'
        );
    }

    public function product()
    {
        return $this->belongsTo(
            Product::class,
            'product_id'
        );
    }
}
