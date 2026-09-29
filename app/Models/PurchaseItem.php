<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\GoodsReceivedNoteItem;

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
