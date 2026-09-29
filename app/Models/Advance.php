<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Advance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'amount',
        'note',
        'date',
        'file',
        'advance_by'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function advanceBy()
    {
        return $this->belongsTo(User::class, 'advance_by');
    }

}
