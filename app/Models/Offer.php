<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Offer extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'unit_id',
        'offered_price',
        'discount_percent',
        'approved_by',
        'status',
        'remarks'
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
