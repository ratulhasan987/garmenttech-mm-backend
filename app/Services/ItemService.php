<?php

namespace App\Services;

use App\Models\Brand;
use App\Models\Item;
use App\Models\ItemCategory;
use App\Models\ItemType;
use App\Models\Unit;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ItemService
{
    public function getPaginated(): LengthAwarePaginator
    {
        return Item::query()
            ->with(['itemType:id,name', 'category:id,name', 'brand:id,name', 'unit:id,name'])
            ->latest()
            ->paginate(30);
    }

    public function getRelationsData(): array
    {
        return [
            'itemTypes' => ItemType::select('id', 'name')->orderBy('name')->get(),
            'itemCategories' => ItemCategory::select('id', 'name')->orderBy('name')->get(),
            'brands' => Brand::select('id', 'name')->orderBy('name')->get(),
            'units' => Unit::select('id', 'name')->orderBy('name')->get(),
        ];
    }

    public function createItem(array $data): Item
    {
        return Item::create($data);
    }

    public function updateItem(Item $item, array $data): Item
    {
        $item->update($data);

        return $item->fresh();
    }

    public function deleteItem(Item $item): bool
    {
        return $item->delete();
    }
}