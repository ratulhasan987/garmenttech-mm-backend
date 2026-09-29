<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'status',
    ];

    // Type has many products
    public function products()
    {
        return $this->hasMany(Product::class, 'type_id');
    }

    // Type has many categories
    public function categories()
    {
        return $this->hasMany(ProductCategory::class, 'type_id');
    }
}
