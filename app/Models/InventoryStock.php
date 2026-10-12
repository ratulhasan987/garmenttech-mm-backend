<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryStock extends Model
{
    protected $fillable = ['item_id', 'unit', 'quantity', 'reserved_quantity'];

    protected function casts(): array
    {
        return [
            'quantity'           => 'decimal:4',
            'reserved_quantity'  => 'decimal:4',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}