<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'item_id',
        'unit',
        'quantity',
        'unit_price',
        'discount',
        'taxes',
        'total_tax',
        'total_amount',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'item_id');
    }
}
