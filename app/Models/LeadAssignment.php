<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $lead_id
 * @property int $assigned_to
 * @property int $assigned_by
 * @property string $assignment_type
 * @property string|null $reason
 * @property string $assigned_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment whereAssignedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment whereAssignedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment whereAssignedTo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment whereAssignmentType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadAssignment whereReason($value)
 * @mixin \Eloquent
 */
class LeadAssignment extends Model
{
    use HasFactory;
}
