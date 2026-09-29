<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesInvoiceItem extends Model
{
    protected $fillable = [
        'sales_invoice_id',
        'product_id',
        'quantity',
        'unit_price',
        'discount',
        'tax',
        'tax_ids',
        'line_total',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'discount' => 'decimal:2',
            'tax' => 'decimal:2',
            'tax_ids' => 'array',
            'line_total' => 'decimal:2',
        ];
    }

    // Invoice
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(
            SalesInvoice::class,
            'sales_invoice_id'
        );
    }

    // Product
    public function product(): BelongsTo
    {
        return $this->belongsTo(
            Product::class
        );
    }

    // Return items
    public function returnItems(): HasMany
    {
        return $this->hasMany(
            SalesReturnItem::class,
            'sales_invoice_item_id'
        );
    }
}