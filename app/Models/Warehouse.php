<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warehouse extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'phone',
        'address',
        'status',
        'is_default',
    ];

    
    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'is_default' => 'boolean',
        ];
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(
            Stock::class
        );
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(
            StockMovement::class
        );
    }
}