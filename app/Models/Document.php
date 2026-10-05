<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property string|null $resume
 * @property string|null $nid_card
 * @property string|null $as_per_nid_image
 * @property string|null $father_nid
 * @property string|null $mother_nid
 * @property string|null $relative_nid_primary
 * @property string|null $relative_nid_secondary
 * @property string|null $non_relative_nid_primary
 * @property string|null $non_relative_nid_secondary
 * @property string|null $educational_certificate
 * @property string|null $professional_certificate
 * @property string|null $training_certificate
 * @property string|null $professional_referance_primary
 * @property string|null $professional_referance_secondary
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Department|null $department
 * @property-read \App\Models\Designation|null $designation
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereAsPerNidImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereEducationalCertificate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereFatherNid($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereMotherNid($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereNidCard($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereNonRelativeNidPrimary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereNonRelativeNidSecondary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereProfessionalCertificate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereProfessionalReferancePrimary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereProfessionalReferanceSecondary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereRelativeNidPrimary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereRelativeNidSecondary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereResume($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereTrainingCertificate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Document whereUserId($value)
 * @mixin \Eloquent
 */
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
