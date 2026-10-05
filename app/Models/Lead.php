<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $lead_code
 * @property string|null $name
 * @property string|null $company_name
 * @property string $phone
 * @property string|null $phone_secondary
 * @property string|null $phone_foreign
 * @property string|null $email
 * @property int|null $area_id
 * @property int|null $sector_id
 * @property int|null $profession_id
 * @property int|null $designation_id
 * @property int|null $source_id
 * @property int $stage_id
 * @property int|null $assigned_to
 * @property string $priority
 * @property string|null $interest_level
 * @property \Carbon\CarbonImmutable|null $last_contacted_at
 * @property \Carbon\CarbonImmutable|null $next_follow_up_at
 * @property string|null $remarks
 * @property bool $is_converted
 * @property \Carbon\CarbonImmutable|null $converted_at
 * @property int|null $customer_id
 * @property string|null $address
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Area|null $area
 * @property-read \App\Models\User|null $assignedUser
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\Deal|null $deal
 * @property-read \App\Models\LeadDesignation|null $designation
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Followup> $followups
 * @property-read int|null $followups_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeadConversation> $leadConversations
 * @property-read int|null $lead_conversations_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeadProduct> $leadProducts
 * @property-read int|null $lead_products_count
 * @property-read \App\Models\LeadSource|null $leadSource
 * @property-read \App\Models\LeadStage $leadStage
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\NegotiationLog> $negotiations
 * @property-read int|null $negotiations_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Offer> $offers
 * @property-read int|null $offers_count
 * @property-read \App\Models\Profession|null $profession
 * @property-read \App\Models\Sector|null $sector
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SiteVisit> $siteVisits
 * @property-read int|null $site_visits_count
 * @property-read \App\Models\LeadStage $stage
 * @property-read \App\Models\User|null $updatedby
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead accessible(\App\Models\User $user)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereAreaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereAssignedTo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereCompanyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereConvertedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereDesignationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereInterestLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereIsConverted($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereLastContactedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereLeadCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereNextFollowUpAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead wherePhoneForeign($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead wherePhoneSecondary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead wherePriority($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereProfessionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereSectorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereSourceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereStageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Lead whereUpdatedBy($value)
 * @mixin \Eloquent
 */
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
