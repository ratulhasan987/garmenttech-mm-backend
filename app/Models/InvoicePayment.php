<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoicePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'receipt_no',
        'invoice_id',
        'invoice_payment_configure_id',
        'date',
        'pay_amount',
        'payment_method',
        'bank_name',
        'branch',
        'account_id',
        'reference',
        'created_by',
        'description',
        'attachment',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class, 'invoice_id');
    }

    public function configure()
    {
        return $this->belongsTo(InvoicePaymentConfigure::class, 'invoice_payment_configure_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Direct vendor access through Invoice
    public function client()
    {
        return $this->hasOneThrough(
            Client::class,  // final model
            Invoice::class,    // intermediate model
            'id',           // Local key on Invoice (Invoice.id)
            'id',           // Local key on Vendor (Vendor.id)
            'invoice_id',      // Foreign key on InvoicePayment (invoice_id)
            'client_id'     // Foreign key on Invoice (client_id)
        );
    }

    // Direct vendor access through Invoice
    public function user()
    {
        return $this->hasOneThrough(
            User::class,  // final model
            Invoice::class,    // intermediate model
            'id',           // Local key on Invoice (Invoice.id)
            'id',           // Local key on Vendor (User.id)
            'invoice_id',      // Foreign key on InvoicePayment (invoice_id)
            'user_id'     // Foreign key on Invoice (user_id)
        );
    }

    public function paymentStep()
    {
        return $this->belongsTo(InvoicePaymentConfigure::class, 'invoice_payment_configure_id');
    }
}
