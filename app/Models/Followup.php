<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $lead_id
 * @property int $user_id
 * @property string $scheduled_at
 * @property string $type
 * @property string|null $outcome
 * @property int|null $next_stage_id
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereNextStageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereOutcome($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereScheduledAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Followup whereUserId($value)
 * @mixin \Eloquent
 */
class Followup extends Model
{
    use HasFactory;
}
