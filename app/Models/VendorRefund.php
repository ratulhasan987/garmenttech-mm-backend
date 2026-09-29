<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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