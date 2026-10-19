<?php

namespace App\Services;

use App\Models\Building;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

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
        return DB::transaction(function () use ($data) {
            $data['code'] = $this->generateNextCode();

            return Building::create($data);
        });
    }

    public function updateBuilding(Building $building, array $data): Building
    {
        unset($data['code']);

        $building->update($data);

        return $building->fresh();
    }

    public function deleteBuilding(Building $building): bool
    {
        return $building->delete();
    }

    protected function generateNextCode(): string
    {
        // Lock the table to prevent race conditions when generating the next code
        $latestCode = Building::query()
            ->lockForUpdate()
            ->where('code', 'like', 'B%')
            ->orderByRaw('CAST(SUBSTRING(code, 2) AS UNSIGNED) DESC')
            ->value('code');

        if (!$latestCode) {
            return 'B1';
        }

        // Extract the numeric part and increment
        $number = (int) substr($latestCode, 1);

        return 'B' . ($number + 1);
    }

}
