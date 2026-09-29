<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
