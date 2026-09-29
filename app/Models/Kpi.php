<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
