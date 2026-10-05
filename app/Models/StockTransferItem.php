<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $stock_transfer_id
 * @property int $item_id
 * @property string $unit
 * @property numeric $quantity
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Product|null $product
 * @property-read \App\Models\StockTransfer $stockTransfer
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem whereStockTransferId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransferItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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