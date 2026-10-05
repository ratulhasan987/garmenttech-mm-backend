<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string|null $code
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read string $status_label
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadDesignation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadDesignation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadDesignation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadDesignation whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadDesignation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadDesignation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadDesignation whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadDesignation whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeadDesignation whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class LeadDesignation extends Model
{
    protected $fillable = [
        'name',
        'code',
        'status',
    ];

    // Optional: Helper for readable status
    public function getStatusLabelAttribute(): string
    {
        return ucfirst($this->status); // e.g. "Actionable" or "Default"
    }
}
