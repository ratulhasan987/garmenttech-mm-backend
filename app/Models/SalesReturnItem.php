<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $sales_return_id
 * @property int $sales_invoice_item_id
 * @property int $product_id
 * @property numeric $quantity
 * @property numeric $unit_price
 * @property numeric $line_total
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\SalesInvoiceItem $invoiceItem
 * @property-read \App\Models\Product $product
 * @property-read \App\Models\SalesReturn $salesReturn
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem whereLineTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem whereSalesInvoiceItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem whereSalesReturnId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesReturnItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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