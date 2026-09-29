<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
