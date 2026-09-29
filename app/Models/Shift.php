<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'shift_start_time',
        'shift_end_time',
        'first_half_shift_end_time',
        'second_half_shift_start_time',
        'weekends',
    ];

}
