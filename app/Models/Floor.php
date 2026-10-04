<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Floor extends Model
{
    use HasFactory;

    protected $fillable = [
        'building_id',
        'name',
        'floor_number',
        'code',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'floor_number' => 'integer',
            'is_active' => 'boolean',
        ];
    }


    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }


    public function machines(): HasMany
    {
        return $this->hasMany(Machine::class);
    }
}
