<?php

namespace App\Services;

use App\Models\Attribute;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AttributeService
{
    public function getPaginated(): LengthAwarePaginator
    {
        return Attribute::query()->latest()->paginate(30);
    }

    public function getAllAttributes()
    {
        return Attribute::query()->select('id', 'name', 'type', 'options')->orderBy('name')->get();
    }

    public function createAttribute(array $data): Attribute
    {
        // Only save options if type is select
        if (isset($data['type']) && $data['type'] !== 'select') {
            $data['options'] = null;
        }
        return Attribute::create($data);
    }

    public function updateAttribute(Attribute $attribute, array $data): Attribute
    {
        if (isset($data['type']) && $data['type'] !== 'select') {
            $data['options'] = null;
        }
        $attribute->update($data);
        return $attribute->fresh();
    }

    public function deleteAttribute(Attribute $attribute): bool
    {
        return $attribute->delete();
    }
}