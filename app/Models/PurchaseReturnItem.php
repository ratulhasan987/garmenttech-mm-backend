<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseReturnItem extends Model
{
    protected $fillable = [

        'purchase_return_id',
        'product_id',
        'quantity',
        'unit_price',
        'tax_amount',
        'line_total'

    ];


    public function product()
    {
        return $this->belongsTo(
            Product::class,
            'product_id'
        );
    }


    public function purchaseReturn()
    {
        return $this->belongsTo(
            PurchaseReturn::class,
            'purchase_return_id'
        );
    }
}