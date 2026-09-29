<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\PurchaseOrderPayment;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = [

        'order_id',
        'requisition_id',
        'is_requisition_based',
        'vendor_id',
        'warehouse_id',
        'procurement_id',
        'sub_total',
        'order_tax',
        'order_discount',
        'shipping_cost',
        'grand_total',
        'order_date',
        'expected_delivery',
        'document',
        'note',
        'status',
        'created_by'
    ];

    protected $casts = [
        'is_requisition_based' => 'boolean',
    ];

    public function purchaseItems()
    {
        return $this->hasMany(PurchaseItem::class, 'purchase_order_id');
    }

    public function requisition()
    {
        return $this->belongsTo(Requisition::class, 'requisition_id');
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function tax()
    {
        return $this->belongsTo(Tax::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    public function purchaseOrderPayments()
    {
        return $this->hasMany(PurchaseOrderPayment::class, 'purchase_order_id');
    }

}
