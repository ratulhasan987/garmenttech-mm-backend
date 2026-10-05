<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $invoice_no
 * @property int $client_id
 * @property int $warehouse_id
 * @property \Carbon\CarbonImmutable $invoice_date
 * @property numeric $subtotal
 * @property numeric $discount
 * @property numeric $tax
 * @property numeric $adjustment_amount
 * @property numeric $grand_total
 * @property numeric $paid_amount
 * @property numeric $due_amount
 * @property string $status
 * @property string $payment_status
 * @property string|null $remarks
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Client $client
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalesInvoiceItem> $items
 * @property-read int|null $items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalesPayment> $payments
 * @property-read int|null $payments_count
 * @property-read \App\Models\AccountsReceivable|null $receivable
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalesReturn> $returns
 * @property-read int|null $returns_count
 * @property-read \App\Models\Warehouse $warehouse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereAdjustmentAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereClientId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereDiscount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereDueAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereGrandTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereInvoiceDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereInvoiceNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice wherePaidAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice wherePaymentStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereSubtotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesInvoice whereWarehouseId($value)
 * @mixin \Eloquent
 */
class SalesInvoice extends Model
{

    protected $fillable = [

        'invoice_no',
        'client_id',
        'warehouse_id',
        'invoice_date',
        'subtotal',
        'discount',
        'tax',
        'adjustment_amount',
        'grand_total',
        'paid_amount',
        'due_amount',
        'status',
        'payment_status',
        'remarks',
    ];


    protected function casts(): array
    {
        return [

            'invoice_date'
                => 'date:Y-m-d',


            'subtotal'
                => 'decimal:2',


            'discount'
                => 'decimal:2',


            'tax'
                => 'decimal:2',


            'adjustment_amount'
                => 'decimal:2',


            'grand_total'
                => 'decimal:2',


            'paid_amount'
                => 'decimal:2',


            'due_amount'
                => 'decimal:2',

        ];
    }



    // Customer
    public function client(): BelongsTo
    {
        return $this->belongsTo(
            Client::class,
            'client_id'
        );
    }



    // Warehouse
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(
            Warehouse::class
        );
    }



    // Items
    public function items(): HasMany
    {
        return $this->hasMany(
            SalesInvoiceItem::class,
            'sales_invoice_id'
        );
    }



    // Payments
    public function payments(): HasMany
    {
        return $this->hasMany(
            SalesPayment::class,
            'sales_invoice_id'
        );
    }



    // Returns
    public function returns(): HasMany
    {
        return $this->hasMany(
            SalesReturn::class,
            'sales_invoice_id'
        );
    }

    public function receivable()
    {
        return $this->hasOne(AccountsReceivable::class, 'source_id')->where('source_type', 'sales_invoice');
    }
}
