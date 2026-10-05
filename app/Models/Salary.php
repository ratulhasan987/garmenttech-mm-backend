<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property numeric $basic_salary
 * @property numeric $transport_allowance
 * @property numeric $family_allowance
 * @property numeric $others_allowance
 * @property numeric $overtime
 * @property numeric $gross_salary
 * @property numeric $loan_deduction
 * @property numeric $salary_advance
 * @property numeric $state_tax
 * @property numeric $social_security
 * @property string|null $total_absent
 * @property numeric $absent_deduction
 * @property numeric $total_consecutive_late
 * @property numeric $consecutive_late_deduction
 * @property numeric $total_late_minutes
 * @property numeric $late_minutes_deduction
 * @property numeric $total_remaining_minutes
 * @property numeric $remaining_minutes_deduction
 * @property numeric $unpaid_leave
 * @property numeric $unpaid_leave_deduction
 * @property numeric $total_deductions
 * @property numeric $net_salary
 * @property string $status
 * @property string $month
 * @property int|null $updated_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereAbsentDeduction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereBasicSalary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereConsecutiveLateDeduction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereFamilyAllowance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereGrossSalary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereLateMinutesDeduction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereLoanDeduction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereMonth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereNetSalary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereOthersAllowance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereOvertime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereRemainingMinutesDeduction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereSalaryAdvance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereSocialSecurity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereStateTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereTotalAbsent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereTotalConsecutiveLate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereTotalDeductions($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereTotalLateMinutes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereTotalRemainingMinutes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereTransportAllowance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereUnpaidLeave($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereUnpaidLeaveDeduction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereUpdatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Salary whereUserId($value)
 * @mixin \Eloquent
 */
class Salary extends Model
{
    use HasFactory;

    protected $fillable = [
       'user_id',
        'basic_salary',
        'transport_allowance',
        'family_allowance',
        'others_allowance',
        'overtime',
        'gross_salary',
        'loan_deduction',
        'salary_advance',
        'state_tax',
        'social_security',
        'total_absent',
        'absent_deduction',
        'total_consecutive_late',
        'consecutive_late_deduction',
        'total_late_minutes',
        'late_minutes_deduction',
        'total_remaining_minutes',
        'remaining_minutes_deduction',
        'unpaid_leave',
        'unpaid_leave_deduction',
        'total_deductions',
        'net_salary',
        'status',
        'month',
        'updated_by',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
