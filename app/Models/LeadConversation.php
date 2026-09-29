<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadConversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'user_id',
        'channel',
        'message',
        'call_direction',
        'call_duration',
        'requires_follow_up',
        'next_follow_up_at',
        'stage_id',
    ];

    protected $casts = [
        'requires_follow_up' => 'boolean',
        'next_follow_up_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class, 'lead_id');
    }
}
