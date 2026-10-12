<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemAttributeOption extends Model
{
    protected $fillable = ['item_attribute_id', 'value', 'label', 'sort_order'];

    protected function casts(): array
    {
        return ['sort_order' => 'integer'];
    }

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(ItemAttribute::class, 'item_attribute_id');
    }
}