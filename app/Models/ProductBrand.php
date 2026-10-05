<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product> $products
 * @property-read int|null $products_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBrand newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBrand newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBrand query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBrand whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBrand whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBrand whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProductBrand whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class ProductBrand extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    public function products(): HasMany
    {
        return $this->hasMany(
            Product::class,
            'product_brand_id'
        );
    }
}
