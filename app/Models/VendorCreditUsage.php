<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $vendor_credit_id
 * @property int $bill_id
 * @property numeric $amount
 * @property int|null $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Bill $bill
 * @property-read \App\Models\VendorCredit $vendorCredit
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage whereBillId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorCreditUsage whereVendorCreditId($value)
 * @mixin \Eloquent
 */
class VendorCreditUsage extends Model
{

    protected $fillable = [

        'vendor_credit_id',

        'bill_id',

        'amount',

        'created_by',

    ];



    public function vendorCredit()
    {
        return $this->belongsTo(
            VendorCredit::class
        );
    }



    public function bill()
    {
        return $this->belongsTo(
            Bill::class
        );
    }

}