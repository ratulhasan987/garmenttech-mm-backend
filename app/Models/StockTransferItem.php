<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockTransferItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'stock_transfer_id',
        'item_id',
        'unit',
        'quantity',
    ];

    protected $casts = [
        'quantity' =>
            'decimal:2',
    ];

    /*
    |--------------------------------------------------------------------------
    | Stock Transfer
    |--------------------------------------------------------------------------
    */

    public function stockTransfer(): BelongsTo
    {
        return $this->belongsTo(
            StockTransfer::class,
            'stock_transfer_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Product
    |--------------------------------------------------------------------------
    */

    public function product(): BelongsTo
    {
        return $this->belongsTo(
            Product::class,
            'item_id'
        );
    }
}