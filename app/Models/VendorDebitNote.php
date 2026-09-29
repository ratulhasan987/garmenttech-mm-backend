<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VendorDebitNote extends Model
{
    protected $fillable = ['debit_note_no', 'purchase_return_id', 'vendor_id', 'debit_note_date', 'due_date', 'subtotal', 'tax_amount', 'grand_total', 'created_by'];

    protected function casts(): array
    {
        return ['debit_note_date' => 'date', 'due_date' => 'date', 'subtotal' => 'decimal:2', 'tax_amount' => 'decimal:2', 'grand_total' => 'decimal:2'];
    }

    public function purchaseReturn() { return $this->belongsTo(PurchaseReturn::class); }
    public function vendor() { return $this->belongsTo(Vendor::class); }
    public function createdBy() { return $this->belongsTo(User::class, 'created_by'); }
}
