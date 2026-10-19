<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemAttributeValue extends Model
{
    protected $fillable = [
        'item_id', 'item_attribute_id', 'option_id',
        'value_text', 'value_integer', 'value_decimal',
        'value_boolean', 'value_date',
    ];

    protected function casts(): array
    {
        return [
            'value_integer' => 'integer',
            'value_decimal' => 'decimal:6',
            'value_boolean' => 'boolean',
            'value_date'    => 'date',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(ItemAttribute::class, 'item_attribute_id');
    }

    public function option(): BelongsTo
    {
        return $this->belongsTo(ItemAttributeOption::class);
    }
}