<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'product_category_id',
        'product_brand_id',
        'unit_id',
        'reorder_level',
        'purchase_price',
        'sales_price',
        'purchase_tax_ids',
        'sales_tax_ids',
        'status',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'reorder_level' => 'decimal:2',
            'purchase_price' => 'decimal:2',
            'sales_price' => 'decimal:2',
            'purchase_tax_ids' => 'array',
            'sales_tax_ids' => 'array',
            'status' => 'boolean',
        ];
    }

    // Category
    public function category(): BelongsTo
    {
        return $this->belongsTo(
            ProductCategory::class,
            'product_category_id'
        );
    }

    // Brand
    public function brand(): BelongsTo
    {
        return $this->belongsTo(
            ProductBrand::class,
            'product_brand_id'
        );
    }

    // Unit
    public function unit(): BelongsTo
    {
        return $this->belongsTo(
            Unit::class,
            'unit_id'
        );
    }

    // Stock
    public function stocks(): HasMany
    {
        return $this->hasMany(
            Stock::class,
            'item_id'
        );
    }

    // Stock movements
    public function stockMovements(): HasMany
    {
        return $this->hasMany(
            StockMovement::class,
            'item_id'
        );
    }

    public function leadProducts()
    {
        return $this->hasMany(LeadProduct::class);
    }
}
