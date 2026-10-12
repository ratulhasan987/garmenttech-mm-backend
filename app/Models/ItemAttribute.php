<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ItemAttribute extends Model
{
    protected $fillable = [
        'name', 'code', 'data_type', 'unit_id',
        'description', 'is_required', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
            'is_active'   => 'boolean',
        ];
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(ItemAttributeOption::class);
    }
}