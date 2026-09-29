<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Incentive extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'month',
        'own_target',
        'coordinator_target',
        'total_target',
        'achievement',
        'amount',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
