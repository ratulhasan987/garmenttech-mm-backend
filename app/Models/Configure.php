<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Configure extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'logo',
        'primary_logo',
        'secondary_logo',
        'phone',
        'email',
        'address',
    ];

}
