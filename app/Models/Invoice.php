<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_no',
        'client_id',
        'user_id',
        'sub_total',
        'total_tax',
        'total_discount',
        'grand_total',
        'paid_amount',
        'due_amount',
        'payment_status',
        'payment_method',
        'invoice_date',
        'due_date',
        'attachments',
        'created_by',
        'created_at',
        'updated_at'
    ];

    public function invoiceitems()
    {
        return $this->hasMany(InvoiceItem::class, 'invoice_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tax()
    {
        return $this->belongsTo(Tax::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function payments()
    {
        return $this->hasMany(InvoicePayment::class, 'invoice_id');
    }
}
