<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property string|null $description
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property string|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalesTeamMember> $members
 * @property-read int|null $members_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeam whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class SalesTeam extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'status',
    ];

    public function members()
    {
        return $this->hasMany(SalesTeamMember::class);
    }
}
