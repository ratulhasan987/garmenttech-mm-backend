<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Designation extends Model
{
    use HasFactory;

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
