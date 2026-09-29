<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leave extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'qty',
        'is_default', 
    ];

      protected $casts = [
        'is_default' => 'boolean',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_leave')
                    ->withPivot('start_date', 'end_date', 'remaining_days');
    }


    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

}
