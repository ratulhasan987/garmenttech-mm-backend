<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\Machine;
use App\Models\Floor;
use App\Services\MachineService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MachineLocationController extends Controller
{
    public function __construct(
        protected MachineService $machineService
    ) {}

    // 1. List of Buildings and Floors
     // 1. List of Buildings and Floors
    public function index(): Response
    {
        if (!auth()->user()?->can('machine.list')) {
            abort(403, 'Unauthorized access');
        }

        $buildings = Building::with(['floors' => function($query) {
            $query->orderBy('floor_number');
        }])->orderBy('name')->get();

        // Count active machines manually via the machine_locations table
        $buildings->each(function ($building) {
           
        
        $building->floors->each(function ($floor) {
                $floor->active_machines_count = \App\Models\MachineLocation::where('floor_id', $floor->id)
                    ->whereNull('removed_at')
                    ->count();
            });
        
        
        
            });

        return Inertia::render('machine/LocationIndex', [
            'buildings' => $buildings,
        ]);
    }
    // 2. The Visual Floor Plan Page
    public function showFloor(Floor $floor): Response
    {
        if (!auth()->user()?->can('machine.list')) {
            abort(403, 'Unauthorized access');
        }

        $floor->load('building');

        // Fetch ALL active machines globally so React can build the side-by-side view instantly
        $allMachines = Machine::with(['model', 'currentLocation.floor.building'])
            ->whereHas('currentLocation')
            ->get()
            ->map(function ($machine) {
                return [
                    'id' => $machine->id,
                    'machine_id' => $machine->machine_id,
                    'model_name' => $machine->model->name ?? 'N/A',
                    'status' => $machine->status,
                    'sl_no' => $machine->currentLocation->sl_no,
                    'floor_id' => $machine->currentLocation->floor_id,
                    'building_name' => $machine->currentLocation->floor->building->name ?? 'N/A',
                    'floor_number' => $machine->currentLocation->floor->floor_number ?? 0,
                ];
            });

        // Fetch all floors with building name for the dropdown selector
        $allFloors = Floor::with('building:id,name')->orderBy('floor_number')->get();

        return Inertia::render('machine/FloorPlan', [
            'floor' => $floor,
            'allMachines' => $allMachines,
            'allFloors' => $allFloors,
        ]);
    }

    // 3. Swap two machines on the same floor
    public function swap(Request $request)
    {
        if (!auth()->user()?->can('machine.edit')) {
            abort(403, 'Unauthorized access');
        }

        $validated = $request->validate([
            'machine1_id' => ['required', 'integer', 'exists:machines,id'],
            'machine2_id' => ['required', 'integer', 'exists:machines,id'],
        ]);

        try {
            $machine1 = Machine::findOrFail($validated['machine1_id']);
            $machine2 = Machine::findOrFail($validated['machine2_id']);
            $this->machineService->swapMachines($machine1, $machine2);

            return redirect()->back()->with('success', 'Machines swapped successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        }
    }

    // 4. Move multiple machines to a new floor
    public function moveToFloor(Request $request)
    {
        if (!auth()->user()?->can('machine.edit')) {
            abort(403, 'Unauthorized access');
        }

        $validated = $request->validate([
            'machine_ids' => ['required', 'array'],
            'machine_ids.*' => ['integer', 'exists:machines,id'],
            'target_floor_id' => ['required', 'integer', 'exists:floors,id'],
        ]);

        try {
            $this->machineService->moveMachinesToFloor($validated['machine_ids'], $validated['target_floor_id']);
            return redirect()->back()->with('success', 'Machines moved to new floor successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        }
    }

    // 5. Unassign a machine
    public function removeLocation(Machine $machine)
    {
        if (!auth()->user()?->can('machine.edit')) {
            abort(403, 'Unauthorized access');
        }

        $this->machineService->removeFromCurrentLocation($machine, 'Manually unassigned from location board.');
        return redirect()->back()->with('success', 'Machine unassigned successfully.');
    }


// 6. Bulk unassign multiple machines
public function bulkRemoveLocation(Request $request)
{
    if (!auth()->user()?->can('machine.edit')) {
        abort(403, 'Unauthorized access');
    }

    $validated = $request->validate([
        'machine_ids'   => ['required', 'array', 'min:1'],
        'machine_ids.*' => ['integer', 'exists:machines,id'],
    ]);

    try {
        foreach ($validated['machine_ids'] as $machineId) {
            $machine = Machine::find($machineId);
            if ($machine) {
                $this->machineService->removeFromCurrentLocation(
                    $machine,
                    'Manually unassigned from location board (bulk).'
                );
            }
        }

        return redirect()->back()->with(
            'success',
            count($validated['machine_ids']) . ' machine(s) unassigned successfully.'
        );
    } catch (\Illuminate\Validation\ValidationException $e) {
        return redirect()->back()->withErrors($e->errors())->withInput();
    }
}



// Move a single machine to a specific slot (empty slot)
public function moveToSlot(Request $request)
{
    if (!auth()->user()?->can('machine.edit')) {
        abort(403, 'Unauthorized access');
    }

    $validated = $request->validate([
        'machine_id' => ['required', 'integer', 'exists:machines,id'],
        'floor_id'   => ['required', 'integer', 'exists:floors,id'],
        'sl_no'      => ['required', 'string'],
    ]);

    try {
        $machine = Machine::findOrFail($validated['machine_id']);
        $this->machineService->moveMachineToSlot(
            $machine,
            $validated['floor_id'],
            $validated['sl_no']
        );

        return redirect()->back()->with('success', 'Machine moved to new slot successfully.');
    } catch (\Illuminate\Validation\ValidationException $e) {
        return redirect()->back()->withErrors($e->errors())->withInput();
    }
}

}