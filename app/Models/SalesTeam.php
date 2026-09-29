<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
