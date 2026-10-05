<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $stock_transfer_id
 * @property int $from_warehouse_id
 * @property int $to_warehouse_id
 * @property int $transferred_by
 * @property \Carbon\CarbonImmutable $transfer_date
 * @property numeric|null $transportation_cost
 * @property numeric $grand_total
 * @property string|null $note
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Warehouse $fromWarehouse
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StockTransferItem> $items
 * @property-read int|null $items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StockTransferItem> $stockTransferItems
 * @property-read int|null $stock_transfer_items_count
 * @property-read \App\Models\Warehouse $toWarehouse
 * @property-read \App\Models\User $transferredBy
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereFromWarehouseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereGrandTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereStockTransferId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereToWarehouseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereTransferDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereTransferredBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereTransportationCost($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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