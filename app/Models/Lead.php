<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_code',
        'name',
        'company_name',
        'phone',
        'phone_secondary',
        'phone_foreign',
        'email',
        'area_id',
        'sector_id',
        'profession_id',
        'designation_id',
        'project_id',
        'source_id',
        'stage_id',
        'assigned_to',
        'priority',
        'interest_level',
        'last_contacted_at',
        'next_follow_up_at',
        'remarks',
        'is_converted',
        'converted_at',
        'customer_id',
        'address',
        'created_by',
        'updated_by',
        'created_at',
        'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'is_converted' => 'boolean',
            'converted_at' => 'datetime',
            'last_contacted_at' => 'datetime',
            'next_follow_up_at' => 'datetime',
        ];
    }

    public function scopeAccessible($query, User $user)
    {
        // No global permission → only own leads
        if (!$user->can('lead.global')) {
            return $query->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                ->orWhere('assigned_to', $user->id);
            });
        }

        // Has lead.global → only the teams where *this user* is manager
        $userIds = $user->managedTeamUserIds();

        return $query->where(function ($q) use ($userIds) {
            $q->whereIn('created_by', $userIds)
            ->orWhereIn('assigned_to', $userIds);
        });
    }

    public function leadStage()
    {
        return $this->belongsTo(LeadStage::class, 'stage_id');
    }

    public function leadSource()
    {
        return $this->belongsTo(LeadSource::class, 'source_id');
    }

    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public function sector()
    {
        return $this->belongsTo(Sector::class, 'sector_id');
    }

    public function profession()
    {
        return $this->belongsTo(Profession::class);
    }

    public function designation()
    {
        return $this->belongsTo(LeadDesignation::class, 'designation_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedby()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function leadConversations()
    {
        return $this->hasMany(LeadConversation::class);
    }

    public function followups()
    {
        return $this->hasMany(Followup::class);
    }

    public function siteVisits()
    {
        return $this->hasMany(SiteVisit::class);
    }

    public function offers()
    {
        return $this->hasMany(Offer::class);
    }

    public function negotiations()
    {
        return $this->hasMany(NegotiationLog::class);
    }

    public function deal()
    {
        return $this->hasOne(Deal::class);
    }

    public function stage()
    {
        return $this->belongsTo(
            LeadStage::class,
            'stage_id',
        );
    }

    public function leadProducts()
    {
        return $this->hasMany(LeadProduct::class);
    }
}
