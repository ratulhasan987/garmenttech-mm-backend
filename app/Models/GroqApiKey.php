<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroqApiKey extends Model
{
    protected $fillable = ['key', 'fingerprint', 'last_four'];

    protected $hidden = ['key', 'fingerprint'];

    protected $casts = ['key' => 'encrypted'];
}
