<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserLeave extends Model
{
    use HasFactory;

    // Table name
    protected $table = 'user_leave';

    // Fillable fields
    protected $fillable = [
        'user_id',
        'leave_id',
        'start_date',
        'end_date',
        'remaining_days',
    ];

    // User Model
    public function leaves()
    {
        return $this->belongsToMany(Leave::class, 'user_leave');
    }

    // Leave Model
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_leave');
    }

}
