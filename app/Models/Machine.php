<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Machine extends Model
{
    protected $fillable = [
        'machine_id',
        'model_id',
        'code',
        'qr_code',
        'notes',
        'status',
    ];

    // Relationships

    public function model(): BelongsTo
    {
        return $this->belongsTo(MachineModel::class, 'model_id');
    }

    public function locations(): HasMany
    {
        return $this->hasMany(MachineLocation::class);
    }

    public function currentLocation(): HasOne
    {
        return $this->hasOne(MachineLocation::class)->whereNull('removed_at');
    }

    // Helpers

    public function isCurrentlyAssigned(): bool
    {
        return $this->currentLocation()->exists();
    }
}
