<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\GoodsReceivedNoteItem;

/**
 * @property int $id
 * @property int $purchase_order_id
 * @property int|null $requisition_item_id
 * @property int $item_id
 * @property string $unit
 * @property numeric $quantity
 * @property numeric $unit_price
 * @property array<array-key, mixed>|null $taxes
 * @property numeric|null $tax_amount
 * @property numeric|null $line_total
 * @property int|null $warehouse_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, GoodsReceivedNoteItem> $goodsReceivedNoteItems
 * @property-read int|null $goods_received_note_items_count
 * @property-read \App\Models\Product|null $product
 * @property-read \App\Models\PurchaseOrder $purchaseOrder
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereLineTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem wherePurchaseOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereRequisitionItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereTaxAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereTaxes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseItem whereWarehouseId($value)
 * @mixin \Eloquent
 */
class PurchaseItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_order_id',
        'requisition_item_id',
        'item_id',
        'unit',
        'quantity',
        'unit_price',
        'taxes',
        'tax_amount',
        'line_total',
        'warehouse_id'
    ];

    protected $casts = [
        'taxes' => 'array',
    ];

    public function product()
    {
        return $this->belongsTo(
            Product::class,
            'item_id'
        );
    }

    // PurchaseItem.php
    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function goodsReceivedNoteItems()
    {
        return $this->hasMany(
            GoodsReceivedNoteItem::class,
            'purchase_item_id'
        );
    }

}
