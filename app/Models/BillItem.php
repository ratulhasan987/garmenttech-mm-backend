<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $bill_id
 * @property int $goods_received_note_item_id
 * @property int $purchase_item_id
 * @property int $item_id
 * @property string|null $unit
 * @property numeric $quantity
 * @property numeric $unit_price
 * @property numeric $discount
 * @property array<array-key, mixed>|null $taxes
 * @property numeric $total_tax
 * @property numeric $total_amount
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Bill $bill
 * @property-read \App\Models\GoodsReceivedNoteItem $goodsReceivedNoteItem
 * @property-read \App\Models\Product|null $product
 * @property-read \App\Models\PurchaseItem $purchaseItem
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereBillId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereDiscount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereGoodsReceivedNoteItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem wherePurchaseItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereTaxes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereTotalAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereTotalTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class BillItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'bill_id',
        'goods_received_note_item_id',
        'purchase_item_id',
        'item_id',
        'unit',
        'quantity',
        'unit_price',
        'discount',
        'taxes',
        'total_tax',
        'total_amount',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'discount' => 'decimal:2',
        'taxes' => 'array',
        'total_tax' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function bill()
    {
        return $this->belongsTo(
            Bill::class,
            'bill_id'
        );
    }

    public function goodsReceivedNoteItem()
    {
        return $this->belongsTo(
            GoodsReceivedNoteItem::class,
            'goods_received_note_item_id'
        );
    }

    public function purchaseItem()
    {
        return $this->belongsTo(
            PurchaseItem::class,
            'purchase_item_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | item_id = products.id
    |--------------------------------------------------------------------------
    */

    public function product()
    {
        return $this->belongsTo(
            Product::class,
            'item_id'
        );
    }
}
