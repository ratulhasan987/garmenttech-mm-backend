<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
