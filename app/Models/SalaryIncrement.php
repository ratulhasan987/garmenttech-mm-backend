<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
