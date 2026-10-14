<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    protected $fillable = [
        'name',
        'type',
        'options',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array', // Automatically handles JSON encode/decode
        ];
    }
}