<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockAdjustmentHeader extends Model
{
    protected $fillable = [
        'adjustment_id', 'adjusted_by', 'adjustment_date',
        'reason', 'note', 'status',
    ];

    protected function casts(): array
    {
        return ['adjustment_date' => 'date'];
    }

    public function adjustedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'adjusted_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(StockAdjustmentItem::class, 'stock_adjustment_id');
    }
}