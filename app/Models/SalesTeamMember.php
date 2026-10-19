<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $sales_team_id
 * @property int $user_id
 * @property string $role
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $joined_at
 * @property \Carbon\CarbonImmutable|null $left_at
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\SalesTeam $team
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember whereJoinedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember whereLeftAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember whereSalesTeamId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalesTeamMember whereUserId($value)
 * @mixin \Eloquent
 */
class SalesTeamMember extends Model
{
    protected $fillable = [
        'sales_team_id',
        'user_id',
        'role',
        'is_active',
        'joined_at',
        'left_at',
    ];

    protected $casts = [
        'joined_at' => 'date',
        'left_at' => 'date',
        'is_active' => 'boolean',
    ];

    public function team()
    {
        return $this->belongsTo(SalesTeam::class,'sales_team_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
