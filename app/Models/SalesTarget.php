<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTarget newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTarget newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTarget query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTarget whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTarget whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTarget whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class SalesTarget extends Model
{
    use HasFactory;
}
