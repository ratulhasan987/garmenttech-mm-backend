<?php

namespace App\Services;

use App\Models\MachineCategory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class MachineCategoryService
{

    public function getPaginated(): LengthAwarePaginator
    {
        return MachineCategory::query()
            ->latest()
            ->paginate(30);
    }

    public function createCategory(array $data): MachineCategory
    {
        return MachineCategory::create([
            'parent_id' => $data['parent_id'] ?? null,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    public function updateCategory(MachineCategory $category, array $data): MachineCategory
    {
        // Prevent setting parent_id to itself
        if (isset($data['parent_id']) && $data['parent_id'] == $category->id) {
            throw new InvalidArgumentException('A category cannot be its own parent.');
        }

        // Prevent setting a child/descendant as its parent (circular reference)
        if (isset($data['parent_id']) && $this->isDescendant($category, $data['parent_id'])) {
            throw new InvalidArgumentException('Cannot assign a descendant category as parent.');
        }

        $category->update($data);

        return $category->fresh();
    }


    public function deleteCategory(MachineCategory $category, bool $reassignChildrenToParent = false): bool
    {
        return DB::transaction(function () use ($category, $reassignChildrenToParent) {
            if ($reassignChildrenToParent) {
                // Shift child categories up to the deleted category's parent
                $category->children()->update([
                    'parent_id' => $category->parent_id,
                ]);
            }

            return $category->delete();
        });
    }

    public function toggleStatus(MachineCategory $category): MachineCategory
    {
        $category->update([
            'is_active' => !$category->is_active,
        ]);

        return $category;
    }

    /**
     * Circular hierarchy prevention helper.
     */
    protected function isDescendant(MachineCategory $category, int $targetParentId): bool
    {
        $childrenIds = $category->children()->pluck('id')->toArray();

        if (in_array($targetParentId, $childrenIds)) {
            return true;
        }

        foreach ($category->children as $child) {
            if ($this->isDescendant($child, $targetParentId)) {
                return true;
            }
        }

        return false;
    }
}
