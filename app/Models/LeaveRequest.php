<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'leave_id',
        'start_date',
        'end_date',
        'leave_type',
        'sub_type',
        'days',
        'reporting_officer',
        'reporting_officer_status',
        'status',
        'reason',
        'attachment',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function leave()
    {
        return $this->belongsTo(Leave::class);
    }
}
