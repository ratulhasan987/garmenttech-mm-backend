<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $lead_id
 * @property int|null $from_stage_id
 * @property int $to_stage_id
 * @property int $changed_by
 * @property string $changed_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStageHistory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStageHistory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStageHistory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStageHistory whereChangedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStageHistory whereChangedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStageHistory whereFromStageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStageHistory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStageHistory whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStageHistory whereToStageId($value)
 * @mixin \Eloquent
 */
class LeadStageHistory extends Model
{
    use HasFactory;
}
