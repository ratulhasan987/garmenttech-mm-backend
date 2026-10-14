<?php

namespace App\Services;

use App\Models\ItemCategory;
use App\Models\ItemType;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ItemCategoryService
{
    public function getPaginated(): LengthAwarePaginator
    {
        return ItemCategory::query()
            ->with(['parent:id,name', 'itemType:id,name'])
            ->latest()
            ->paginate(30);
    }

    public function getItemTypes()
    {
        return ItemType::query()->select('id', 'name')->orderBy('name')->get();
    }

    public function getParentCategories()
    {
        return ItemCategory::query()->select('id', 'name')->orderBy('name')->get();
    }

    public function createItemCategory(array $data): ItemCategory
    {
        return ItemCategory::create($data);
    }

    public function updateItemCategory(ItemCategory $itemCategory, array $data): ItemCategory
    {
        $itemCategory->update($data);

        return $itemCategory->fresh();
    }

    public function deleteItemCategory(ItemCategory $itemCategory): bool
    {
        return $itemCategory->delete();
    }
}