<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $item_category_id
 * @property int|null $brand_id
 * @property string $name
 * @property string|null $part_number
 * @property string|null $sku
 * @property string|null $barcode
 * @property string|null $description
 * @property int|null $minimum_stock
 * @property int|null $reorder_stock
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereBarcode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereBrandId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereItemCategoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereMinimumStock($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item wherePartNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereReorderStock($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereSku($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Item whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Item extends Model
{
    //
}
