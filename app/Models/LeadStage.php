<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadStage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'pipeline_type',
        'project_type',
        'probability_percent',
        'order',
        'color',
        'is_active',
        'is_default',
        'is_convert_to_customer'
    ];

    public function leads()
    {
        return $this->hasMany(Lead::class, 'stage_id');
    }
}
