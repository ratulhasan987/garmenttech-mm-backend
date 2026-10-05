<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property string $increment_type
 * @property numeric $increment_value
 * @property numeric $increment_amount
 * @property numeric $old_basic_salary
 * @property numeric $new_basic_salary
 * @property string $effective_date
 * @property string $status
 * @property int|null $approved_by
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\User|null $approvedBy
 * @property-read \App\Models\Department|null $department
 * @property-read \App\Models\Designation|null $designation
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereEffectiveDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereIncrementAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereIncrementType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereIncrementValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereNewBasicSalary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereOldBasicSalary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SalaryIncrement whereUserId($value)
 * @mixin \Eloquent
 */
class SalaryIncrement extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'increment_type',
        'increment_value',
        'increment_amount',
        'old_basic_salary',
        'new_basic_salary',
        'effective_date',
        'status',
        'approved_by',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // SalaryIncrement -> User -> Department
    public function department()
    {
        return $this->hasOneThrough(
            Department::class, // Final model
            User::class,       // Intermediate model
            'id',              // Foreign key on users table
            'id',              // Foreign key on departments table
            'user_id',     // Local key on salary_increments table
            'department_id'    // Local key on users table
        );
    }

    // SalaryIncrement -> User -> Designation
    public function designation()
    {
        return $this->hasOneThrough(
            Designation::class,
            User::class,
            'id',
            'id',
            'user_id',
            'designation_id'
        );
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
