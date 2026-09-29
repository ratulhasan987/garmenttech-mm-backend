<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
