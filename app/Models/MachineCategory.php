<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int|null $parent_id
 * @property string $name
 * @property string|null $description
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, MachineCategory> $children
 * @property-read int|null $children_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MachineModel> $machineModels
 * @property-read int|null $machine_models_count
 * @property-read MachineCategory|null $parent
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory whereParentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineCategory whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class MachineCategory extends Model
{
    protected $fillable = [
        'parent_id',
        'name',
        'description',
        'is_active'
    ];


    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }


    public function parent(): BelongsTo
    {
        return $this->belongsTo(
            MachineCategory::class,
            'parent_id'
        );
    }


    public function children(): HasMany
    {
        return $this->hasMany(
            MachineCategory::class,
            'parent_id'
        );
    }


    public function machineModels(): HasMany
    {
        return $this->hasMany(
            MachineModel::class,
            'machine_category_id'
        );
    }
}
