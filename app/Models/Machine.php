<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property string $machine_id
 * @property int $model_id
 * @property string $code
 * @property string|null $notes
 * @property string $status
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\MachineLocation|null $currentLocation
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MachineLocation> $locations
 * @property-read int|null $locations_count
 * @property-read \App\Models\MachineModel $model
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine whereMachineId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine whereModelId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Machine whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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
