<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteVisit extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'project_id',
        'scheduled_at',
        'visit_date',
        'visit_status',
        'accompanied_by',
        'transport_provided',
        'feedback_rating',
        'interest_level',
        'remarks'
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
