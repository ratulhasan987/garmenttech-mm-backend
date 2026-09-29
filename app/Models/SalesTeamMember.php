<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
