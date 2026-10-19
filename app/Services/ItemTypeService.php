<?php

namespace App\Services;

use App\Models\ItemType;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

class ItemTypeService
{
    public function getPaginated(): LengthAwarePaginator
    {
        return ItemType::query()
            ->latest()
            ->paginate(30);
    }

    public function createItemType(array $data): ItemType
    {
        return ItemType::create($data);
    }

    public function updateItemType(ItemType $itemType, array $data): ItemType
    {
        $itemType->update($data);

        return $itemType->fresh();
    }

    public function deleteItemType(ItemType $itemType): bool
    {
        return $itemType->delete();
    }

    public function searchItemTypes(Request $request)
    {
        $keyword = $request->keyword;

        $query = ItemType::query()
            ->select('id', 'code', 'name');

        if (!empty($keyword)) {
            $query->where(function ($query) use ($keyword) {
                $query->where('name', 'like', "%{$keyword}%")
                      ->orWhere('code', 'like', "%{$keyword}%");
            });
        }

        return $query->orderBy('name')->limit(20)->get();
    }
}