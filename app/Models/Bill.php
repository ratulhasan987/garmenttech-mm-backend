<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $bill_no
 * @property int $goods_received_note_id
 * @property int $purchase_order_id
 * @property int $vendor_id
 * @property numeric $sub_total
 * @property numeric $total_tax
 * @property numeric $total_discount
 * @property numeric $shipping_cost
 * @property numeric $grand_total
 * @property numeric $paid_amount
 * @property numeric $due_amount
 * @property string $payment_status
 * @property \Carbon\CarbonImmutable $bill_date
 * @property \Carbon\CarbonImmutable|null $due_date
 * @property string|null $attachments
 * @property int|null $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BillItem> $billItems
 * @property-read int|null $bill_items_count
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\GoodsReceivedNote $goodsReceivedNote
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BillItem> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\AccountsPayable|null $payable
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BillPayment> $payments
 * @property-read int|null $payments_count
 * @property-read \App\Models\PurchaseOrder $purchaseOrder
 * @property-read \App\Models\Vendor $vendor
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereAttachments($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereBillDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereBillNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereDueAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereDueDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereGoodsReceivedNoteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereGrandTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill wherePaidAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill wherePaymentStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill wherePurchaseOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereShippingCost($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereSubTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereTotalDiscount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereTotalTax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Bill whereVendorId($value)
 * @mixin \Eloquent
 */
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
