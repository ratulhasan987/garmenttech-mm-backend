<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'product_id',
        'product_code',
        'product_name',
        'unit',
        'quantity',
        'estimated_price_per_unit',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'estimated_price_per_unit' => 'decimal:2',
        ];
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
