<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
