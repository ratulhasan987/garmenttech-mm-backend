<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'stock_transfer_id',
        'from_warehouse_id',
        'to_warehouse_id',
        'transferred_by',
        'transfer_date',
        'transportation_cost',
        'grand_total',
        'note',
        'status',
    ];

    protected $casts = [
        'transfer_date' =>
            'date:Y-m-d',

        'transportation_cost' =>
            'decimal:2',

        'grand_total' =>
            'decimal:2',
    ];

    /*
    |--------------------------------------------------------------------------
    | From Warehouse
    |--------------------------------------------------------------------------
    */

    public function fromWarehouse(): BelongsTo
    {
        return $this->belongsTo(
            Warehouse::class,
            'from_warehouse_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | To Warehouse
    |--------------------------------------------------------------------------
    */

    public function toWarehouse(): BelongsTo
    {
        return $this->belongsTo(
            Warehouse::class,
            'to_warehouse_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Transferred By
    |--------------------------------------------------------------------------
    */

    public function transferredBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'transferred_by'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Items
    |--------------------------------------------------------------------------
    */

    public function stockTransferItems(): HasMany
    {
        return $this->hasMany(
            StockTransferItem::class,
            'stock_transfer_id'
        );
    }

    public function items(): HasMany
    {
        return $this->stockTransferItems();
    }
}