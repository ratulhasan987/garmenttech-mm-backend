<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $lead_id
 * @property int|null $project_id
 * @property string $scheduled_at
 * @property string|null $visit_date
 * @property string $visit_status
 * @property int|null $accompanied_by
 * @property int $transport_provided
 * @property int|null $feedback_rating
 * @property string|null $interest_level
 * @property string|null $remarks
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Lead $lead
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereAccompaniedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereFeedbackRating($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereInterestLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereScheduledAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereTransportProvided($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereVisitDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SiteVisit whereVisitStatus($value)
 * @mixin \Eloquent
 */
class SiteVisit extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'project_id',
        'scheduled_at',
        'visit_date',
        'visit_status',
        'accompanied_by',
        'transport_provided',
        'feedback_rating',
        'interest_level',
        'remarks'
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
