<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property string $loan_details
 * @property numeric $amount
 * @property int $duration
 * @property numeric $monthly_installment
 * @property string $status
 * @property string|null $approval_date
 * @property string|null $repayment_from
 * @property numeric|null $interest
 * @property string|null $repayment_amount
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LoanInstallment> $installments
 * @property-read int|null $installments_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereApprovalDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereDuration($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereInterest($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereLoanDetails($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereMonthlyInstallment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereRepaymentAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereRepaymentFrom($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Loan whereUserId($value)
 * @mixin \Eloquent
 */
class Loan extends Model
{
    use HasFactory;


    protected $fillable = [
        'user_id',
        'loan_details',
        'amount',
        'duration',
        'monthly_installment',
        'status',
        'applied_date',
        'approval_date',
        'repayment_from',
        'interest',
        'repayment_amount',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function installments()
    {
        return $this->hasMany(LoanInstallment::class);
    }
}
