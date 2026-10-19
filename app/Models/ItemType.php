<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ItemType extends Model
{
    protected $fillable = [
        'name', 'code', 'description',
        'is_consumable', 'is_serialized', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_consumable' => 'boolean',
            'is_serialized' => 'boolean',
            'is_active'     => 'boolean',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(Item::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(ItemCategory::class);
    }
}