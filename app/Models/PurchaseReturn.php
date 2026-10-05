<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $return_no
 * @property int $vendor_id
 * @property int|null $purchase_order_id
 * @property int|null $bill_id
 * @property int $warehouse_id
 * @property string $return_date
 * @property numeric $subtotal
 * @property numeric $tax_amount
 * @property numeric $grand_total
 * @property string $status
 * @property int|null $created_by
 * @property int|null $approved_by
 * @property string|null $document
 * @property string|null $note
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $approvedBy
 * @property-read \App\Models\Bill|null $bill
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\VendorDebitNote|null $debitNote
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PurchaseReturnItem> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\PurchaseOrder|null $purchaseOrder
 * @property-read \App\Models\AccountsReceivable|null $receivable
 * @property-read \App\Models\Vendor $vendor
 * @property-read \App\Models\Warehouse $warehouse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereBillId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereDocument($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereGrandTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn wherePurchaseOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereReturnDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereReturnNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereSubtotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereTaxAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereVendorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseReturn whereWarehouseId($value)
 * @mixin \Eloquent
 */
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
