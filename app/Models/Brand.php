<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string|null $country
 * @property string|null $website
 * @property string|null $description
 * @property bool $is_active
 * @property \Carbon\CarbonImmutable|null $created_at
 * @property \Carbon\CarbonImmutable|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MachineModel> $machineModels
 * @property-read int|null $machine_models_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand whereCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Brand whereWebsite($value)
 * @mixin \Eloquent
 */
class Brand extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'country',
        'code',
        'website',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function machineModels(): HasMany
    {
        return $this->hasMany(MachineModel::class);
    }



}
