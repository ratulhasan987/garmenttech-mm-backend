<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property int $product_category_id
 * @property int|null $product_brand_id
 * @property int $unit_id
 * @property numeric $reorder_level
 * @property numeric $purchase_price
 * @property numeric $sales_price
 * @property array<array-key, mixed>|null $purchase_tax_ids
 * @property array<array-key, mixed>|null $sales_tax_ids
 * @property bool $status
 * @property string|null $description
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\ProductBrand|null $brand
 * @property-read \App\Models\ProductCategory $category
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeadProduct> $leadProducts
 * @property-read int|null $lead_products_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StockMovement> $stockMovements
 * @property-read int|null $stock_movements_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Stock> $stocks
 * @property-read int|null $stocks_count
 * @property-read \App\Models\Unit $unit
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereProductBrandId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereProductCategoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product wherePurchasePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product wherePurchaseTaxIds($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereReorderLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereSalesPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereSalesTaxIds($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereUnitId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Product whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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
