<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $lead_id
 * @property int $product_id
 * @property string $product_code
 * @property string $product_name
 * @property string|null $unit
 * @property numeric|null $quantity
 * @property numeric|null $estimated_price_per_unit
 * @property string|null $remarks
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Lead $lead
 * @property-read \App\Models\Product $product
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereEstimatedPricePerUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereProductCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereProductName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadProduct whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class LeadProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'product_id',
        'product_code',
        'product_name',
        'unit',
        'quantity',
        'estimated_price_per_unit',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'estimated_price_per_unit' => 'decimal:2',
        ];
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
