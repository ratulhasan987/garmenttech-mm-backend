<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
/**
 * @property int $id
 * @property int $stock_adjustment_id
 * @property int $item_id
 * @property string|null $unit
 * @property string $adjustment_type
 * @property numeric $quantity
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Product|null $product
 * @property-read \App\Models\StockAdjustment $stockAdjustment
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem whereAdjustmentType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem whereStockAdjustmentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem whereUnit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustmentItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class StockAdjustmentItem extends Model {
    use HasFactory;
    protected $fillable = ['stock_adjustment_id','item_id','unit','adjustment_type','quantity'];
    protected $casts = ['quantity'=>'decimal:2'];
    public function stockAdjustment(): BelongsTo { return $this->belongsTo(StockAdjustment::class, 'stock_adjustment_id'); }
    public function product(): BelongsTo { return $this->belongsTo(Product::class, 'item_id'); }
}
