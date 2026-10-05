<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\PurchaseOrderPayment;

/**
 * @property int $id
 * @property string $order_id
 * @property int|null $requisition_id
 * @property bool $is_requisition_based
 * @property int $vendor_id
 * @property int|null $warehouse_id
 * @property numeric $sub_total
 * @property numeric|null $order_tax
 * @property numeric|null $order_discount
 * @property numeric|null $shipping_cost
 * @property numeric $grand_total
 * @property string|null $order_date
 * @property string|null $expected_delivery
 * @property string|null $document
 * @property string|null $note
 * @property string $status
 * @property int|null $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $createdBy
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PurchaseItem> $purchaseItems
 * @property-read int|null $purchase_items_count
 * @property-read \App\Models\Requisition|null $requisition
 * @property-read \App\Models\Tax|null $tax
 * @property-read \App\Models\Vendor $vendor
 * @property-read \App\Models\Warehouse|null $warehouse
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereDocument($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereExpectedDelivery($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereGrandTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereIsRequisitionBased($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereOrderDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereOrderDiscount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereOrderTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereRequisitionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereShippingCost($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereSubTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereVendorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchaseOrder whereWarehouseId($value)
 * @mixin \Eloquent
 */
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
