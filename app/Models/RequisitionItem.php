<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequisitionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'requisition_id',
        'product_id',
        'previously_requisitioned',
        'remaining_quantity',
        'quantity',
        'item_id',
        'unit',
        'required_date',
        'priority',
        'status',
    ];

    protected $casts = [
        'previously_requisitioned' => 'decimal:2',
        'remaining_quantity' => 'decimal:2',
        'quantity' => 'decimal:2',
        'required_date' => 'date',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function requisition()
    {
        return $this->belongsTo(
            Requisition::class,
            'requisition_id'
        );
    }

    public function product()
    {
        return $this->belongsTo(
            Product::class,
            'product_id'
        );
    }
}
