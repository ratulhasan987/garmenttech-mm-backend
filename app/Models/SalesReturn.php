<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesReturn extends Model
{
    protected $fillable = [
        'return_no',
        'sales_invoice_id',
        'warehouse_id',
        'return_date',
        'total_amount',
        'status',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'return_date' =>
                'date:Y-m-d',

            'total_amount' =>
                'decimal:2',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(
            SalesInvoice::class,
            'sales_invoice_id'
        );
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(
            Warehouse::class
        );
    }

    public function items(): HasMany
    {
        return $this->hasMany(
            SalesReturnItem::class
        );
    }

    public function financeTransactions(): HasMany
    {
        return $this->hasMany(FinanceTransaction::class);
    }
}
