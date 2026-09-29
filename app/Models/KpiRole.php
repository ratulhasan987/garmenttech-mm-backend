<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpiRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'incentive',
        'coordination_incentive',
    ];
}
