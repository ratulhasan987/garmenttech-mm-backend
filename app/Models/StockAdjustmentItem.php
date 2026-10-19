<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockAdjustmentItem extends Model
{
    protected $fillable = [
        'stock_adjustment_id', 'item_id',
        'quantity', 'difference', 'reason',
    ];

    protected function casts(): array
    {
        return [
            'quantity'  => 'decimal:4',
            'difference' => 'decimal:4',
        ];
    }

    // public function adjustment(): BelongsTo
    // {
    //     return $this->belongsTo(StockAdjustmentHeader::class, 'stock_adjustment_id');
    // }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}