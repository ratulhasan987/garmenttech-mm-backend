<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $lead_id
 * @property int $user_id
 * @property string $notify_at
 * @property string|null $read_at
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Lead|null $lead
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification whereNotifyAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification whereReadAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadFollowupNotification whereUserId($value)
 * @mixin \Eloquent
 */
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
