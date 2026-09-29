<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_no',
        'date',
        'module',
        'user_id',
        'vendor_id',
        'client_id',
        'invoice_id',
        'bill_id',
        'description',
        'posted_by',
        'approved_by',
        'status',
        'attachments'
    ];

    protected $casts = [
        'attachments' => 'array', // <== converts JSON string to PHP array automatically
    ];

    public function lines()
    {
        return $this->hasMany(JournalLine::class);
    }

    public function postedBy()
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function salesReference()
    {
        return $this->belongsTo(Invoice::class, 'invoice_id');
    }

    public function purchaseReference()
    {
        return $this->belongsTo(Bill::class, 'bill_id');
    }
}
