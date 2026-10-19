<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $grn_no
 * @property int $purchase_order_id
 * @property int $warehouse_id
 * @property \Carbon\CarbonImmutable $received_date
 * @property int $received_by
 * @property string $status
 * @property int|null $approved_by
 * @property array<array-key, mixed>|null $attachments
 * @property string|null $note
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $approvedBy
 * @property-read \App\Models\Bill|null $bill
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GoodsReceivedNoteItem> $goodsReceivedNoteItems
 * @property-read int|null $goods_received_note_items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\GoodsReceivedNoteItem> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\PurchaseOrder $purchaseOrder
 * @property-read \App\Models\User $receivedBy
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StockMovement> $stockMovements
 * @property-read int|null $stock_movements_count
 * @property-read \App\Models\Warehouse $warehouse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereAttachments($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereGrnNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote wherePurchaseOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereReceivedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereReceivedDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNote whereWarehouseId($value)
 * @mixin \Eloquent
 */
class GoodsReceivedNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'grn_no',
        'purchase_order_id',
        'warehouse_id',
        'received_date',
        'received_by',
        'status',
        'approved_by',
        'attachments',
        'note',
    ];

    protected $casts = [
        'received_date' => 'date:Y-m-d',
        'attachments' => 'array',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function purchaseOrder()
    {
        return $this->belongsTo(
            PurchaseOrder::class,
            'purchase_order_id'
        );
    }

    public function warehouse()
    {
        return $this->belongsTo(
            Warehouse::class,
            'warehouse_id'
        );
    }

    public function receivedBy()
    {
        return $this->belongsTo(
            User::class,
            'received_by'
        );
    }

    public function approvedBy()
    {
        return $this->belongsTo(
            User::class,
            'approved_by'
        );
    }

    public function goodsReceivedNoteItems()
    {
        return $this->hasMany(
            GoodsReceivedNoteItem::class,
            'goods_received_note_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Short alias
    |--------------------------------------------------------------------------
    */

    public function items()
    {
        return $this->hasMany(
            GoodsReceivedNoteItem::class,
            'goods_received_note_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | One approved GRN generates one bill
    |--------------------------------------------------------------------------
    */

    public function bill()
    {
        return $this->hasOne(
            Bill::class,
            'goods_received_note_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Stock movements generated by this GRN
    |--------------------------------------------------------------------------
    */

    public function stockMovements()
    {
        return $this->morphMany(
            StockMovement::class,
            'reference'
        );
    }
}
