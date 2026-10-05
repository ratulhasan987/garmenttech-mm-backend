<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string|null $pipeline_type
 * @property string|null $project_type
 * @property int $probability_percent 0 - 100
 * @property int $order
 * @property string|null $color
 * @property int $is_active
 * @property int $is_default
 * @property int $is_convert_to_customer Automatically create customer when lead reaches this stage
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Lead> $leads
 * @property-read int|null $leads_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereIsConvertToCustomer($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereIsDefault($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage wherePipelineType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereProbabilityPercent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereProjectType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadStage whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class LeadStage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'pipeline_type',
        'project_type',
        'probability_percent',
        'order',
        'color',
        'is_active',
        'is_default',
        'is_convert_to_customer'
    ];

    public function leads()
    {
        return $this->hasMany(Lead::class, 'stage_id');
    }
}
