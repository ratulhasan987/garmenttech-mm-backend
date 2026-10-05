<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $machine_id
 * @property int $floor_id
 * @property string $sl_no
 * @property \Carbon\CarbonImmutable $assigned_at
 * @property \Carbon\CarbonImmutable|null $removed_at
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property string|null $remarks
 * @property-read \App\Models\Floor $floor
 * @property-read \App\Models\Machine $machine
 * @method static Builder<static>|MachineLocation current()
 * @method static Builder<static>|MachineLocation history()
 * @method static Builder<static>|MachineLocation newModelQuery()
 * @method static Builder<static>|MachineLocation newQuery()
 * @method static Builder<static>|MachineLocation query()
 * @method static Builder<static>|MachineLocation whereAssignedAt($value)
 * @method static Builder<static>|MachineLocation whereCreatedAt($value)
 * @method static Builder<static>|MachineLocation whereFloorId($value)
 * @method static Builder<static>|MachineLocation whereId($value)
 * @method static Builder<static>|MachineLocation whereMachineId($value)
 * @method static Builder<static>|MachineLocation whereRemarks($value)
 * @method static Builder<static>|MachineLocation whereRemovedAt($value)
 * @method static Builder<static>|MachineLocation whereSlNo($value)
 * @method static Builder<static>|MachineLocation whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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
