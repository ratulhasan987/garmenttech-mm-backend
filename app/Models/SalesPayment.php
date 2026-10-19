<?php

namespace App\Models;

use App\Services\FinanceService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $payment_no
 * @property int $sales_invoice_id
 * @property \Carbon\CarbonImmutable $payment_date
 * @property numeric $amount
 * @property string $status
 * @property int|null $approved_by
 * @property \Carbon\CarbonImmutable|null $approved_at
 * @property string $payment_method
 * @property string|null $reference
 * @property string|null $remarks
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\FinanceTransaction|null $financeTransaction
 * @property-read \App\Models\SalesInvoice $invoice
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereApprovedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment wherePaymentDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment wherePaymentMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment wherePaymentNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereReference($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereSalesInvoiceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesPayment whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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
