<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $item_attribute_id
 * @property string $value
 * @property string $label
 * @property int $sort_order
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption whereItemAttributeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption whereSortOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttributeOption whereValue($value)
 * @mixin \Eloquent
 */
class ItemAttributeOption extends Model
{
    //
}
