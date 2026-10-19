<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
/**
 * @property int $id
 * @property string $credit_no
 * @property int $vendor_id
 * @property int|null $purchase_return_id
 * @property numeric $amount
 * @property numeric $used_amount
 * @property numeric $remaining_amount
 * @property string $status
 * @property string|null $note
 * @property int|null $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\PurchaseReturn|null $purchaseReturn
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\VendorRefund> $refunds
 * @property-read int|null $refunds_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\VendorCreditUsage> $usages
 * @property-read int|null $usages_count
 * @property-read \App\Models\Vendor $vendor
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereCreditNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit wherePurchaseReturnId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereRemainingAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereUsedAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCredit whereVendorId($value)
 * @mixin \Eloquent
 */
class VendorCredit extends Model
{

    protected $fillable = [

        'credit_no',

        'vendor_id',

        'purchase_return_id',

        'amount',

        'used_amount',

        'remaining_amount',

        'status',

        'note',

        'created_by',

    ];



    public function vendor()
    {
        return $this->belongsTo(
            Vendor::class
        );
    }



    public function purchaseReturn()
    {
        return $this->belongsTo(
            PurchaseReturn::class
        );
    }



    public function usages()
    {
        return $this->hasMany(
            VendorCreditUsage::class
        );
    }



    public function refunds()
    {
        return $this->hasMany(
            VendorRefund::class
        );
    }


}