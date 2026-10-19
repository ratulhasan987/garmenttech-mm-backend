<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryTransaction extends Model
{
    protected $fillable = [
        'item_id', 'unit', 'quantity',
        'balance_before', 'balance_after',
        'transaction_type', 'remarks', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'quantity'       => 'decimal:4',
            'balance_before' => 'decimal:4',
            'balance_after'  => 'decimal:4',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}