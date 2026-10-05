<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $building_id
 * @property string $name
 * @property int $floor_number
 * @property string $code
 * @property string|null $description
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Building $building
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Machine> $machines
 * @property-read int|null $machines_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereBuildingId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereFloorNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Floor whereUpdatedAt($value)
 * @mixin \Eloquent
 */
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
