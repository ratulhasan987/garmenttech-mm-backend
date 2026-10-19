<?php

namespace App\Models;

use App\Services\FinanceService;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $bill_id
 * @property \Carbon\CarbonImmutable $date
 * @property numeric|null $pay_amount
 * @property int|null $account_id
 * @property string|null $reference
 * @property int|null $created_by
 * @property string|null $description
 * @property string|null $attachment
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Bill $bill
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\FinanceTransaction|null $financeTransaction
 * @property-read \App\Models\Vendor|null $vendor
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereAttachment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereBillId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment wherePayAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereReference($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|BillPayment whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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
