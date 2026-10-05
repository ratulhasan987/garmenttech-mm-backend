<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $project_no
 * @property string $name
 * @property numeric|null $price_per_unit
 * @property numeric|null $purchase_price
 * @property int|null $unit_id
 * @property numeric|null $size
 * @property array<array-key, mixed>|null $taxes
 * @property string|null $location
 * @property string|null $address
 * @property string $status
 * @property string|null $description
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product> $products
 * @property-read int|null $products_count
 * @property-read \App\Models\Unit|null $unit
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereLocation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project wherePricePerUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereProjectNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project wherePurchasePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereTaxes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereUnitId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Project whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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
