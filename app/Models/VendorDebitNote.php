<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $debit_note_no
 * @property int $purchase_return_id
 * @property int $vendor_id
 * @property \Carbon\CarbonImmutable $debit_note_date
 * @property \Carbon\CarbonImmutable $due_date
 * @property numeric $subtotal
 * @property numeric $tax_amount
 * @property numeric $grand_total
 * @property int|null $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\PurchaseReturn $purchaseReturn
 * @property-read \App\Models\Vendor $vendor
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereDebitNoteDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereDebitNoteNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereDueDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereGrandTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote wherePurchaseReturnId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereSubtotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereTaxAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorDebitNote whereVendorId($value)
 * @mixin \Eloquent
 */
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
