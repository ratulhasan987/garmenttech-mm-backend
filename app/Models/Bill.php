<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    use HasFactory;

    protected $fillable = [
        'bill_no',
        'goods_received_note_id',
        'purchase_order_id',
        'vendor_id',
        'sub_total',
        'total_tax',
        'total_discount',
        'shipping_cost',
        'grand_total',
        'paid_amount',
        'due_amount',
        'payment_status',
        'bill_date',
        'due_date',
        'attachments',
        'created_by',
    ];

    protected $casts = [
        'sub_total' => 'decimal:2',
        'total_tax' => 'decimal:2',
        'total_discount' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'due_amount' => 'decimal:2',
        'bill_date' => 'date:Y-m-d',
        'due_date' => 'date:Y-m-d',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function billItems()
    {
        return $this->hasMany(
            BillItem::class,
            'bill_id'
        );
    }

    public function items()
    {
        return $this->hasMany(
            BillItem::class,
            'bill_id'
        );
    }

    public function goodsReceivedNote()
    {
        return $this->belongsTo(
            GoodsReceivedNote::class,
            'goods_received_note_id'
        );
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(
            PurchaseOrder::class,
            'purchase_order_id'
        );
    }

    public function vendor()
    {
        return $this->belongsTo(
            Vendor::class,
            'vendor_id'
        );
    }

    public function createdBy()
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    public function payments()
    {
        return $this->hasMany(
            BillPayment::class,
            'bill_id'
        );
    }

    public function payable()
    {
        return $this->hasOne(AccountsPayable::class);
    }
}
