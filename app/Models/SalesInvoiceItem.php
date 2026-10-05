<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $sales_invoice_id
 * @property int $product_id
 * @property numeric $quantity
 * @property numeric $unit_price
 * @property numeric $discount
 * @property numeric $tax
 * @property array<array-key, mixed>|null $tax_ids
 * @property numeric $line_total
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\SalesInvoice $invoice
 * @property-read \App\Models\Product $product
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalesReturnItem> $returnItems
 * @property-read int|null $return_items_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereDiscount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereLineTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereSalesInvoiceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereTaxIds($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoiceItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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