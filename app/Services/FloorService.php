<?php

namespace App\Services;

use App\Models\Building;
use App\Models\Floor;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class FloorService
{
    public function getPaginated(): LengthAwarePaginator
    {
        return Floor::query()
            ->with('building')
            ->latest()
            ->paginate(30);
    }

    public function createFloor(array $data): Floor
    {
        return DB::transaction(function () use ($data) {
            $data['code'] = $this->generateBuildingScopedCode(
                (int) $data['building_id'],
                (int) $data['floor_number']
            );

            info('debug', $data);

            return Floor::create($data);
        });
    }

    public function updateFloor(Floor $floor, array $data): Floor
    {
        unset($data['code']);

        $floor->update($data);

        return $floor->fresh();
    }

    public function deleteFloor(Floor $floor): bool
    {
        return $floor->delete();
    }

    protected function generateBuildingScopedCode(int $buildingId, int $floorNumber): string
    {
        $building = Building::select('id', 'code')->find($buildingId);

        // Standardize building code fallback
        $buildingCode = $building?->code
            ? strtoupper($building->code)
            : 'BLD' . str_pad((string) $buildingId, 2, '0', STR_PAD_LEFT);

        // Handle ground/basement floor numbers cleanly (e.g., -1 -> B1)
        if ($floorNumber < 0) {
            $formattedFloor = 'B' . abs($floorNumber);
        } else {
            $formattedFloor = sprintf('%02d', $floorNumber);
        }

        $baseCode = "{$buildingCode}-FL{$formattedFloor}";

        // Ensure absolute uniqueness if base code exists
        $code = $baseCode;
        $counter = 1;

        while (Floor::where('code', $code)->exists()) {
            $code = "{$baseCode}-" . sprintf('%02d', $counter);
            $counter++;
        }

        return $code;
    }

}
