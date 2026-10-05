<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $warehouse_id
 * @property int $item_id
 * @property string|null $unit
 * @property numeric $quantity
 * @property numeric $reserved_quantity
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read float $available
 * @property-read float $available_quantity
 * @property-read \App\Models\Product|null $product
 * @property-read \App\Models\Warehouse $warehouse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereReservedQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereWarehouseId($value)
 * @mixin \Eloquent
 */
class Stock extends Model
{
    use HasFactory;

    protected $fillable = [
        'warehouse_id',
        'item_id',
        'unit',
        'quantity',
        'reserved_quantity',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'reserved_quantity' => 'decimal:2',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(
            Warehouse::class,
            'warehouse_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | item_id = products.id
    |--------------------------------------------------------------------------
    */

    public function product(): BelongsTo
    {
        return $this->belongsTo(
            Product::class,
            'item_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Available Stock
    |--------------------------------------------------------------------------
    |
    | available_quantity = quantity - reserved_quantity
    |
    */

    public function getAvailableAttribute(): float
    {
        return (float) $this->quantity
            - (float) $this->reserved_quantity;
    }

    public function getAvailableQuantityAttribute(): float
    {
        return (float) $this->quantity
            - (float) $this->reserved_quantity;
    }
}
