<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesReturnItem extends Model
{
    protected $fillable = [
        'sales_invoice_item_id',
        'product_id',
        'quantity',
        'unit_price',
        'line_total',
    ];

    protected function casts(): array
    {
        return [
            'quantity' =>
                'decimal:2',

            'unit_price' =>
                'decimal:2',

            'line_total' =>
                'decimal:2',
        ];
    }

    public function salesReturn(): BelongsTo
    {
        return $this->belongsTo(
            SalesReturn::class,
            'sales_return_id'
        );
    }

    public function invoiceItem(): BelongsTo
    {
        return $this->belongsTo(
            SalesInvoiceItem::class,
            'sales_invoice_item_id'
        );
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(
            Product::class
        );
    }
}