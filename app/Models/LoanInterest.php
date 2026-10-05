<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $designation_id
 * @property numeric $rate
 * @property string $status
 * @property int $created_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User $createdBy
 * @property-read \App\Models\Designation $designation
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest whereDesignationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest whereRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LoanInterest whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class LoanInterest extends Model
{
    use HasFactory;

    protected $fillable = [
        'designation_id',
        'rate',
        'status',
        'created_by'
    ];

    public function designation()
    {
        return $this->belongsTo(Designation::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
