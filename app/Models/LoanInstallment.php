<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property int $loan_id
 * @property string $month
 * @property numeric $amount
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Loan $loan
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment whereLoanId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment whereMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInstallment whereUserId($value)
 * @mixin \Eloquent
 */
class LoanInstallment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'loan_id',
        'amount',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function loan()
    {
        return $this->belongsTo(loan::class);
    }
}
