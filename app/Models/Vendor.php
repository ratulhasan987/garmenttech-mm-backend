<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory;

        protected $fillable = [
        'vendor_id',
        'name',
        'company_name',
        'email',
        'phone',
        'address',
        'state',
        'city',
        'country',
        'image',
    ];

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }
}
