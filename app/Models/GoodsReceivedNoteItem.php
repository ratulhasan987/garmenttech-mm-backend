<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
