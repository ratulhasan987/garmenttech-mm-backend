<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property numeric|null $cost_per_lead
 * @property int $is_active
 * @property int $is_default
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Lead> $leads
 * @property-read int|null $leads_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource whereCostPerLead($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource whereIsDefault($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadSource whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class LeadSource extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'cost_per_lead',
        'is_active',
        'is_default'
    ];

    public function leads()
    {
        return $this->hasMany(Lead::class, 'source_id');
    }
}
