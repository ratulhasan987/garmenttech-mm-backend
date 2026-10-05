<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $refund_no
 * @property int $vendor_id
 * @property int|null $vendor_credit_id
 * @property numeric $amount
 * @property string $refund_date
 * @property int|null $account_id
 * @property string|null $reference
 * @property string|null $note
 * @property int|null $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Vendor $vendor
 * @property-read \App\Models\VendorCredit|null $vendorCredit
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereAccountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereReference($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereRefundDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereRefundNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereVendorCreditId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VendorRefund whereVendorId($value)
 * @mixin \Eloquent
 */
class VendorRefund extends Model
{

    protected $fillable = [

        'refund_no',

        'vendor_id',

        'vendor_credit_id',

        'amount',

        'refund_date',

        'account_id',

        'reference',

        'note',

        'created_by',

    ];



    public function vendor()
    {
        return $this->belongsTo(
            Vendor::class
        );
    }



    public function vendorCredit()
    {
        return $this->belongsTo(
            VendorCredit::class
        );
    }

}