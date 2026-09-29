<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
