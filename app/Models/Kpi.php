<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $kpi_role_id
 * @property int $user_id
 * @property numeric $target
 * @property int|null $project_id
 * @property int|null $coordinator_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Kpi> $children
 * @property-read int|null $children_count
 * @property-read \App\Models\User|null $coordinator
 * @property-read \App\Models\KpiRole $kpiRole
 * @property-read Kpi|null $parent
 * @property-read \App\Models\Project|null $project
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi whereCoordinatorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi whereKpiRoleId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi whereTarget($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Kpi whereUserId($value)
 * @mixin \Eloquent
 */
class Kpi extends Model
{
    use HasFactory;

    protected $fillable = [
        'kpi_role_id',
        'user_id',
        'target',
        'project_id',
        'coordinator_id',
    ];

    public function children()
    {
        return $this->hasMany(Kpi::class, 'coordinator_id', 'user_id');
    }

    public function parent()
    {
        return $this->belongsTo(Kpi::class, 'coordinator_id', 'user_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function kpiRole()
    {
        return $this->belongsTo(KpiRole::class, 'kpi_role_id');
    }

    public function coordinator()
    {
        return $this->belongsTo(User::class, 'coordinator_id');
    }

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }



}
