<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string $data_type
 * @property int|null $unit_id
 * @property string|null $description
 * @property int $is_required
 * @property int $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute whereDataType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute whereIsRequired($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute whereUnitId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemAttribute whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class ItemAttribute extends Model
{
    //
}
