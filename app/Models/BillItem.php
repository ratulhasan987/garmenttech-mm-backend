<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
