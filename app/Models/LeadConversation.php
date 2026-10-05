<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $lead_id
 * @property int $user_id
 * @property string $channel
 * @property string|null $message
 * @property string|null $call_direction
 * @property int|null $call_duration
 * @property bool $requires_follow_up
 * @property \Carbon\CarbonImmutable|null $next_follow_up_at
 * @property int|null $stage_id
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Lead $lead
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereCallDirection($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereCallDuration($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereChannel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereNextFollowUpAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereRequiresFollowUp($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereStageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadConversation whereUserId($value)
 * @mixin \Eloquent
 */
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
