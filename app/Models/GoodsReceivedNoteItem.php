<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $goods_received_note_id
 * @property int $purchase_item_id
 * @property int $item_id
 * @property string $unit
 * @property numeric $quantity
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\BillItem|null $billItem
 * @property-read \App\Models\GoodsReceivedNote $goodsReceivedNote
 * @property-read \App\Models\Product|null $product
 * @property-read \App\Models\PurchaseItem $purchaseItem
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem whereGoodsReceivedNoteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem wherePurchaseItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|GoodsReceivedNoteItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class GoodsReceivedNoteItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'goods_received_note_id',
        'purchase_item_id',
        'item_id',
        'unit',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function goodsReceivedNote()
    {
        return $this->belongsTo(
            GoodsReceivedNote::class,
            'goods_received_note_id'
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

    /*
    |--------------------------------------------------------------------------
    | Generated bill item
    |--------------------------------------------------------------------------
    */

    public function billItem()
    {
        return $this->hasOne(
            BillItem::class,
            'goods_received_note_item_id'
        );
    }
}
