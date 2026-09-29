<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadSource extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'cost_per_lead',
        'is_active',
        'is_default'
    ];

    public function leads()
    {
        return $this->hasMany(Lead::class, 'source_id');
    }
}
