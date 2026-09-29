<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeadFollowupNotification extends Model
{
    protected $fillable = [
        'lead_id',
        'user_id',
        'notify_at',
        'read_at'
    ];


    protected $with = [
        'lead:id,name,company_name',
        'user:id,name',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }


}
