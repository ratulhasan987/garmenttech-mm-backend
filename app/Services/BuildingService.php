<?php

namespace App\Services;

use App\Models\Building;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class BuildingService
{
    public function getPaginated(): LengthAwarePaginator
    {
        return Building::query()
            ->latest()
            ->paginate(30);
    }

    public function createBuilding(array $data): Building
    {
        return Building::create($data);
    }

    public function updateBuilding(Building $building, array $data): Building
    {
        $building->update($data);

        return $building->fresh();
    }

    public function deleteBuilding(Building $building): bool
    {
        return $building->delete();
    }

}
