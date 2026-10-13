<?php

namespace App\Services;

use App\Models\Building;
use App\Models\Floor;
use App\Models\Machine;
use App\Models\MachineLocation;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MachineLocationService
{
    /**
     * Build the index page data: buildings -> floors -> active machines count.
     */
    public function getBuildingsWithFloors(): array
    {
        $buildings = Building::with(['floors' => function ($query) {
            $query->orderBy('floor_number');
        }])->orderBy('name')->get();

        $buildings->each(function ($building) {
            $building->floors->each(function ($floor) {
                $floor->active_machines_count = MachineLocation::where('floor_id', $floor->id)
                    ->whereNull('removed_at')
                    ->count();
            });
        });

        return ['buildings' => $buildings];
    }

    /**
     * Build the floor plan page data: floor + all active machines (mapped) + all floors.
     */
    public function getFloorPlanData(Floor $floor): array
    {
        $floor->load('building');

        $allMachines = Machine::with(['model', 'currentLocation.floor.building'])
            ->whereHas('currentLocation')
            ->get()
            ->map(function ($machine) {
                return [
                    'id'            => $machine->id,
                    'machine_id'    => $machine->machine_id,
                    'model_name'    => $machine->model->name ?? 'N/A',
                    'status'        => $machine->status,
                    'sl_no'         => $machine->currentLocation->sl_no,
                    'floor_id'      => $machine->currentLocation->floor_id,
                    'building_name' => $machine->currentLocation->floor->building->name ?? 'N/A',
                    'floor_number'  => $machine->currentLocation->floor->floor_number ?? 0,
                ];
            });

        $allFloors = Floor::with('building:id,name')->orderBy('floor_number')->get();

        return [
            'floor'       => $floor,
            'allMachines' => $allMachines,
            'allFloors'   => $allFloors,
        ];
    }

    /**
     * Assign a brand-new location to a machine that has no active location.
     */
    public function assignLocation(Machine $machine, array $data): MachineLocation
    {
        if ($machine->currentLocation()->exists()) {
            throw ValidationException::withMessages([
                'location' => 'Machine already has an active location. Use move instead.',
            ]);
        }

        return $this->createLocationRecord($machine, $data);
    }

    /**
     * Move a machine to a new location (closes old, opens new).
     */
    public function moveMachine(Machine $machine, array $data): MachineLocation
    {
        return DB::transaction(function () use ($machine, $data) {
            $this->removeFromCurrentLocation(
                $machine,
                $data['remarks'] ?? 'Moved to new location'
            );

            return $this->createLocationRecord($machine, $data);
        });
    }

    /**
     * Unassign a machine from its current location.
     */
    public function removeFromCurrentLocation(Machine $machine, ?string $remarks = null): void
    {
        $current = $machine->currentLocation;

        if (!$current) {
            return;
        }

        $current->update([
            'removed_at' => now(),
            'remarks'    => $remarks ?? $current->remarks,
        ]);
    }

    /**
     * Bulk unassign multiple machines from their current locations.
     * Returns the number of machines actually processed.
     */
    public function bulkRemoveFromLocation(
        array $machineIds,
        string $remarks = 'Manually unassigned from location board (bulk).'
    ): int {
        $count = 0;

        foreach ($machineIds as $machineId) {
            $machine = Machine::find($machineId);
            if ($machine) {
                $this->removeFromCurrentLocation($machine, $remarks);
                $count++;
            }
        }

        return $count;
    }

    /**
     * Location history of a machine.
     */
    public function getLocationHistory(Machine $machine)
    {
        return $machine->locations()
            ->with('floor.building')
            ->latest('assigned_at')
            ->get();
    }

    /**
     * Swap the active locations of two machines.
     */
    public function swapMachines(Machine $machine1, Machine $machine2): void
    {
        DB::transaction(function () use ($machine1, $machine2) {
            $loc1 = $machine1->currentLocation()->first();
            $loc2 = $machine2->currentLocation()->first();

            if (!$loc1 || !$loc2) {
                throw ValidationException::withMessages([
                    'machine' => 'Both machines must have an active location to swap.',
                ]);
            }

            $floor1 = $loc1->floor_id;
            $sl1    = $loc1->sl_no;
            $floor2 = $loc2->floor_id;
            $sl2    = $loc2->sl_no;

            // Temporarily mark as removed to avoid unique constraint conflicts
            $loc1->update(['removed_at' => now(), 'remarks' => 'Swapped with ' . $machine2->machine_id]);
            $loc2->update(['removed_at' => now(), 'remarks' => 'Swapped with ' . $machine1->machine_id]);

            $this->createLocationRecord($machine1, [
                'floor_id' => $floor2,
                'sl_no'    => $sl2,
                'remarks'  => 'Swapped location with ' . $machine2->machine_id,
            ]);

            $this->createLocationRecord($machine2, [
                'floor_id' => $floor1,
                'sl_no'    => $sl1,
                'remarks'  => 'Swapped location with ' . $machine1->machine_id,
            ]);
        });
    }

    /**
     * Move multiple machines to a target floor, assigning sequential sl_no.
     */
    public function moveMachinesToFloor(array $machineIds, int $targetFloorId): void
    {
        DB::transaction(function () use ($machineIds, $targetFloorId) {
            $maxSl = MachineLocation::where('floor_id', $targetFloorId)
                ->whereNull('removed_at')
                ->max('sl_no');

            $nextSl = $maxSl ? (int) $maxSl + 1 : 1;

            foreach ($machineIds as $machineId) {
                $machine = Machine::find($machineId);
                if (!$machine) {
                    continue;
                }

                $this->removeFromCurrentLocation($machine, 'Moved to another floor via board');

                $this->createLocationRecord($machine, [
                    'floor_id' => $targetFloorId,
                    'sl_no'    => (string) $nextSl,
                    'remarks'  => 'Moved from another floor',
                ]);
                $nextSl++;
            }
        });
    }

    /**
     * Move a single machine to a specific (must be empty) slot on a floor.
     */
    public function moveMachineToSlot(Machine $machine, int $floorId, string $slNo): MachineLocation
    {
        return DB::transaction(function () use ($machine, $floorId, $slNo) {
            $occupied = MachineLocation::where('floor_id', $floorId)
                ->where('sl_no', $slNo)
                ->whereNull('removed_at')
                ->where('machine_id', '!=', $machine->id)
                ->exists();

            if ($occupied) {
                throw ValidationException::withMessages([
                    'sl_no' => "Slot {$slNo} is already occupied.",
                ]);
            }

            $this->removeFromCurrentLocation($machine, "Moved to slot {$slNo}");

            return $this->createLocationRecord($machine, [
                'floor_id' => $floorId,
                'sl_no'    => $slNo,
                'remarks'  => "Moved to slot {$slNo}",
            ]);
        });
    }

    /**
     * Internal: create a new active location record with conflict checks.
     */
    protected function createLocationRecord(Machine $machine, array $data): MachineLocation
    {
        $exists = MachineLocation::query()
            ->where('floor_id', $data['floor_id'])
            ->where('sl_no', $data['sl_no'])
            ->whereNull('removed_at')
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'location.sl_no' => "This serial number (sl_no: {$data['sl_no']}) is already occupied on the selected floor.",
            ]);
        }

        return MachineLocation::create([
            'machine_id'  => $machine->id,
            'floor_id'    => $data['floor_id'],
            'sl_no'       => $data['sl_no'],
            'assigned_at' => $data['assigned_at'] ?? now(),
            'remarks'     => $data['remarks'] ?? null,
            'removed_at'  => null,
        ]);
    }
}