<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Item extends Model
{
    protected $fillable = [
        'item_type_id', 'item_category_id', 'brand_id', 'unit_id',
        'item_code', 'name', 'part_number', 'sku', 'barcode',
        'description', 'minimum_stock', 'reorder_stock', 'status',
    ];



    public function itemType(): BelongsTo
    {
        return $this->belongsTo(ItemType::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ItemCategory::class, 'item_category_id');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function attributeValues(): HasMany
    {
        return $this->hasMany(ItemAttributeValue::class);
    }

    public function inventoryStock(): HasOne
    {
        return $this->hasOne(InventoryStock::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    public function machineTypes(): HasMany
    {
        return $this->hasMany(MachineTypeItem::class);
    }

    public function serializedComponents(): HasMany
    {
        return $this->hasMany(SerializedComponent::class);
    }
}