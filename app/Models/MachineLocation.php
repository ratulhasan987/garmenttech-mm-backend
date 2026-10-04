<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MachineLocation extends Model
{
    protected $fillable = [
        'machine_id',
        'floor_id',
        'sl_no',
        'assigned_at',
        'removed_at',
        'remarks',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'removed_at' => 'datetime',
    ];

    // Relationships

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    public function floor(): BelongsTo
    {
        return $this->belongsTo(Floor::class);
    }

    // Scopes

    public function scopeCurrent(Builder $query): Builder
    {
        return $query->whereNull('removed_at');
    }

    public function scopeHistory(Builder $query): Builder
    {
        return $query->whereNotNull('removed_at');
    }

    // Helpers

    public function isCurrent(): bool
    {
        return is_null($this->removed_at);
    }
}
