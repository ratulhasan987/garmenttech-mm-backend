<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    use HasFactory;

    protected $fillable = [
        'currency_code',
        'currency_name',
        'symbol',
        'country',
        'exchange_rate',
        'is_active',
    ];

    // Optional: Cast `is_active` to boolean and `exchange_rate` to float
    protected $casts = [
        'is_active' => 'boolean',
        'exchange_rate' => 'float',
    ];

    public static function boot()
    {
        parent::boot();

        static::saving(function ($currency) {
            if ($currency->is_active) {
                // Deactivate all other currencies
                self::where('id', '!=', $currency->id)->update(['is_active' => false]);
            }
        });
    }
}
