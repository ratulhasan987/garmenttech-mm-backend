<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $invoice_id
 * @property string $type
 * @property numeric|null $number_of_installment
 * @property numeric|null $amount
 * @property numeric|null $paid_amount
 * @property numeric|null $percentage
 * @property string|null $installment_type
 * @property string|null $payment_day
 * @property string|null $start_month
 * @property string|null $end_month
 * @property string|null $due_date
 * @property numeric|null $late_fee
 * @property int|null $sequence
 * @property string|null $remarks
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Invoice $invoice
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereDueDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereEndMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereInstallmentType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereInvoiceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereLateFee($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereNumberOfInstallment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure wherePaidAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure wherePaymentDay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure wherePercentage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereSequence($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereStartMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InvoicePaymentConfigure whereUpdatedBy($value)
 * @mixin \Eloquent
 */
class InvoicePaymentConfigure extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'type',
        'number_of_installment',
        'amount',
        'paid_amount',
        'percentage',
        'installment_type',
        'payment_day',
        'start_month',
        'end_month',
        'due_date',
        'late_fee',
        'sequence',
        'remarks',
        'created_by',
        'updated_by',
        'status',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
