<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'resume',
        'nid_card',
        'as_per_nid_image',
        'father_nid',
        'mother_nid',
        'relative_nid_primary',
        'relative_nid_secondary',
        'non_relative_nid_primary',
        'non_relative_nid_secondary',
        'educational_certificate',
        'professional_certificate',
        'training_certificate',
        'professional_referance_primary',
        'professional_referance_secondary',
    ];


    public function documentProgress(): int
    {
        $fields = [
            'resume',
            'nid_card',
            'as_per_nid_image',
            'father_nid',
            'mother_nid',
            'relative_nid_primary',
            'relative_nid_secondary',
            'non_relative_nid_primary',
            'non_relative_nid_secondary',
            'educational_certificate',
            'professional_certificate',
            'training_certificate',
            'professional_referance_primary',
            'professional_referance_secondary',
        ];

        $total = count($fields);

        $completed = collect($fields)
            ->filter(fn ($field) => !empty($this->$field))
            ->count();

        return (int) round(($completed / $total) * 100);
    }


    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function department()
    {
        return $this->hasOneThrough(
            Department::class, // Final model
            User::class,       // Through model
            'id',              // users.id
            'id',              // departments.id
            'user_id',         // current_table.user_id
            'department_id'    // users.department_id
        );
    }

    public function designation()
    {
        return $this->hasOneThrough(
            Designation::class, // Final model
            User::class,        // Through model
            'id',               // users.id
            'id',               // designations.id
            'user_id',          // current_table.user_id
            'designation_id'    // users.designation_id
        );
    }


}
