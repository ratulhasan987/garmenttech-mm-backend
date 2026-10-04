<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
