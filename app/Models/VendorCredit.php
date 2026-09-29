<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
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