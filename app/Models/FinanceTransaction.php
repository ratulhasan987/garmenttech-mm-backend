<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $transaction_no
 * @property \Carbon\CarbonImmutable $transaction_date
 * @property string $direction
 * @property string $transaction_type
 * @property int|null $accounts_receivable_id
 * @property int|null $accounts_payable_id
 * @property int|null $sales_return_id
 * @property string $party_type
 * @property int $party_id
 * @property string|null $payment_type
 * @property int|null $payment_id
 * @property numeric $amount
 * @property string|null $payment_method
 * @property string|null $reference
 * @property string|null $remarks
 * @property int|null $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\AccountsPayable|null $payable
 * @property-read Model|\Eloquent|null $payment
 * @property-read \App\Models\AccountsReceivable|null $receivable
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereAccountsPayableId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereAccountsReceivableId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereDirection($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction wherePartyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction wherePartyType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction wherePaymentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction wherePaymentMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction wherePaymentType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereReference($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereSalesReturnId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereTransactionDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereTransactionNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereTransactionType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|FinanceTransaction whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class FinanceTransaction extends Model
{
    protected $fillable = ['transaction_no', 'transaction_date', 'direction', 'transaction_type', 'accounts_receivable_id', 'accounts_payable_id', 'sales_return_id', 'party_type', 'party_id', 'payment_type', 'payment_id', 'amount', 'payment_method', 'reference', 'remarks', 'created_by'];

    protected function casts(): array
    {
        return ['transaction_date' => 'date', 'amount' => 'decimal:2'];
    }

    public function receivable() { return $this->belongsTo(AccountsReceivable::class, 'accounts_receivable_id'); }
    public function payable() { return $this->belongsTo(AccountsPayable::class, 'accounts_payable_id'); }
    public function payment() { return $this->morphTo(); }
    public function createdBy() { return $this->belongsTo(User::class, 'created_by'); }
}
