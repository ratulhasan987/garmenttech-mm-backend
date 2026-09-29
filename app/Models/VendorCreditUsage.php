<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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