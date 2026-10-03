<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
