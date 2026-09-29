<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;


    protected $fillable = [
        'project_no',
        'name',
        'price_per_unit',
        'purchase_price',
        'unit_id',
        'size',
        'taxes',
        'location',
        'address',
        'status',
        'description'
    ];

    protected $casts = [
        'taxes' => 'array',
    ];

    // Type has many products
    public function products()
    {
        return $this->hasMany(Product::class, 'product_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
