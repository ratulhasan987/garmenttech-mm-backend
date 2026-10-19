<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Machine extends Model
{
    protected $fillable = [
        'machine_id',
        'model_id',
        'floor_id',
        'code',
        'sl_no',
        // 'qr_code',
        'notes',
        'status',
    ];

    public function model(): BelongsTo
    {
        return $this->belongsTo(MachineModel::class, 'model_id');
    }

    public function floor(): BelongsTo
    {
        return $this->belongsTo(Floor::class);
    }

    public function building(): HasOneThrough
    {
        return $this->hasOneThrough(
            Building::class,
            Floor::class,
            'id',          // Foreign key on floors table...
            'id',          // Foreign key on buildings table...
            'floor_id',    // Local key on machines table...
            'building_id'  // Local key on floors table...
        );
    }

    public function brand(): HasOneThrough
    {
        return $this->hasOneThrough(
            Brand::class,
            MachineModel::class,
            'id',          // Foreign key on machine_models table...
            'id',          // Foreign key on brands table...
            'model_id',    // Local key on machines table...
            'brand_id'     // Local key on machine_models table...
        );
    }

    /**
     * Get all location history records for the machine.
     */
    public function locations(): HasMany
    {
        return $this->hasMany(MachineLocation::class);
    }

    /**
     * Get the current active location of the machine.
     */
    public function currentLocation(): HasOne
    {
        return $this->hasOne(MachineLocation::class)
            ->whereNull('removed_at')
            ->latest('assigned_at');
    }
}




