<?php

namespace App\Models;

use App\Services\FinanceService;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'bill_id',
        'date',
        'pay_amount',
        'account_id',
        'reference',
        'created_by',
        'description',
        'attachment',
    ];

    protected $casts = [
        'date' =>
            'datetime',

        'pay_amount' =>
            'decimal:2',

        'account_id' =>
            'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | Bill
    |--------------------------------------------------------------------------
    */

    public function bill()
    {
        return $this->belongsTo(
            Bill::class,
            'bill_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Created By
    |--------------------------------------------------------------------------
    */

    public function createdBy()
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    public function financeTransaction()
    {
        return $this->morphOne(FinanceTransaction::class, 'payment');
    }

    /*
    |--------------------------------------------------------------------------
    | Vendor Through Bill
    |--------------------------------------------------------------------------
    */

    public function vendor()
    {
        return $this->hasOneThrough(
            Vendor::class,
            Bill::class,
            'id',
            'id',
            'bill_id',
            'vendor_id'
        );
    }

    protected static function booted(): void
    {
        static::saved(fn (BillPayment $payment) => app(FinanceService::class)->syncBillPaymentTransaction($payment));
        static::deleting(fn (BillPayment $payment) => app(FinanceService::class)->removePaymentTransaction($payment));
    }
}
