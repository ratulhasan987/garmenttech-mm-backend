<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $item_type_id
 * @property int|null $parent_id
 * @property string $name
 * @property string|null $description
 * @property int $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereItemTypeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereParentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class ItemCategory extends Model
{
    //
}
