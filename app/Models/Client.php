<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $client_no
 * @property string $name
 * @property string $phone
 * @property string|null $email
 * @property string|null $nid_no
 * @property string|null $passport_no
 * @property string|null $tin_no
 * @property \Carbon\CarbonImmutable|null $date_of_birth
 * @property string|null $gender
 * @property string|null $marital_status
 * @property int|null $profession_id
 * @property int|null $lead_designation_id
 * @property string|null $company_name
 * @property string|null $present_address
 * @property string|null $permanent_address
 * @property int|null $area_id
 * @property int|null $sector_id
 * @property string|null $image
 * @property string $status
 * @property int|null $lead_id
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Area|null $area
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\LeadDesignation|null $designation
 * @property-read \App\Models\Lead|null $lead
 * @property-read \App\Models\Profession|null $profession
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SalesInvoice> $salesInvoices
 * @property-read int|null $sales_invoices_count
 * @property-read \App\Models\Sector|null $sector
 * @property-read \App\Models\User|null $updatedBy
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client accessible(\App\Models\User $user)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereAreaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereClientNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereCompanyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereDateOfBirth($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereGender($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereLeadDesignationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereLeadId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereMaritalStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereNidNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client wherePassportNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client wherePermanentAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client wherePresentAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereProfessionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereSectorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereTinNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Client whereUpdatedBy($value)
 * @mixin \Eloquent
 */
class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_no',
        'name',
        'phone',
        'email',

        'nid_no',
        'passport_no',
        'tin_no',

        'date_of_birth',
        'gender',
        'marital_status',

        'profession_id',
        'designation_id',
        'company_name',

        'present_address',
        'permanent_address',
        'area_id',
        'sector_id',

        'image',
        'status',

        'lead_id',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
        ];
    }

    public function scopeAccessible($query, User $user)
    {
        // No global permission → only own customer
        if (!$user->can('customer.global')) {
            return $query->where(function ($q) use ($user) {
                $q->where('created_by', $user->id);
            });
        }

        // Has customer.global → only the teams where *this user* is manager
        $userIds = $user->managedTeamUserIds();

        return $query->where(function ($q) use ($userIds) {
            $q->whereIn('created_by', $userIds);
        });
    }

    public function profession(): BelongsTo
    {
        return $this->belongsTo(Profession::class);
    }

    public function designation(): BelongsTo
    {
        return $this->belongsTo(LeadDesignation::class, 'lead_designation_id');
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class);
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function salesInvoices(): HasMany
    {
        return $this->hasMany(SalesInvoice::class, 'client_id');
    }
}
