<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int|null $machine_category_id
 * @property int|null $brand_id
 * @property string $name
 * @property string $code
 * @property string|null $description
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \App\Models\Brand|null $machineBrand
 * @property-read \App\Models\MachineCategory|null $machineCategory
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel whereBrandId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel whereMachineCategoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MachineModel whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class MachineModel extends Model
{
    protected $fillable = [
        'machine_category_id',
        'brand_id',
        'name',
        'code',
        'description',
        'is_active'
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function machineCategory(): BelongsTo
    {
        return $this->belongsTo(
            MachineCategory::class,
            'machine_category_id'
        );
    }

    public function machineBrand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }
}
