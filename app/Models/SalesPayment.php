<?php

namespace App\Models;

use App\Services\FinanceService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesPayment extends Model
{
    protected $fillable = [
        'payment_no',
        'sales_invoice_id',
        'payment_date',
        'amount',
        'payment_method',
        'reference',
        'remarks',
        'status',
        'approved_by',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'payment_date' => 'date',

            'amount' => 'decimal:2',

            'approved_at' => 'datetime',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(
            SalesInvoice::class,
            'sales_invoice_id'
        );
    }

    public function financeTransaction()
    {
        return $this->morphOne(FinanceTransaction::class, 'payment');
    }

    protected static function booted(): void
    {
        static::saved(fn (SalesPayment $payment) => app(FinanceService::class)->syncSalesPaymentTransaction($payment));
        static::deleting(fn (SalesPayment $payment) => app(FinanceService::class)->removePaymentTransaction($payment));
    }
}
