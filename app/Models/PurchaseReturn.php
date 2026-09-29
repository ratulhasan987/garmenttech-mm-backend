<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseReturn extends Model
{
    protected $fillable = [

        'return_no',
        'vendor_id',
        'purchase_order_id',
        'bill_id',
        'warehouse_id',
        'return_date',
        'subtotal',
        'tax_amount',
        'grand_total',
        'status',
        'created_by',
        'approved_by',
        'note'

    ];


    public function purchaseOrder()
    {
        return $this->belongsTo(
            PurchaseOrder::class,
            'purchase_order_id'
        );
    }

    public function items()
    {
        return $this->hasMany(
            PurchaseReturnItem::class
        );
    }


    public function vendor()
    {
        return $this->belongsTo(
            Vendor::class
        );
    }


    public function warehouse()
    {
        return $this->belongsTo(
            Warehouse::class
        );
    }

    public function createdBy()
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }


    public function approvedBy()
    {
        return $this->belongsTo(
            User::class,
            'approved_by'
        );
    }

    public function bill()
    {
        return $this->belongsTo(
            Bill::class,
            'bill_id'
        );
    }

    public function debitNote()
    {
        return $this->hasOne(VendorDebitNote::class);
    }

    public function receivable()
    {
        return $this->hasOne(AccountsReceivable::class, 'source_id')->where('source_type', 'purchase_return');
    }
}
