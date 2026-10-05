<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $lead_id
 * @property numeric $expected_value
 * @property int $probability
 * @property string|null $expected_close_date
 * @property int $stage_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal whereExpectedCloseDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal whereExpectedValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal whereProbability($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal whereStageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Deal whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Deal extends Model
{
    use HasFactory;
}
