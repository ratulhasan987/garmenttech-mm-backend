<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
