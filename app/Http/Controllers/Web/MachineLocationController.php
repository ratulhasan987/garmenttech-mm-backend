<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Floor;
use App\Models\Machine;
use App\Services\MachineLocationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MachineLocationController extends Controller
{
    public function __construct(
        protected MachineLocationService $locationService
    ) {}

    // 1. List of Buildings and Floors
    public function index(): Response
    {
        $this->requirePermission('machine.list');

        return Inertia::render('machine/LocationIndex', $this->locationService->getBuildingsWithFloors());
    }

    // 2. The Visual Floor Plan Page
    public function showFloor(Floor $floor): Response
    {
        $this->requirePermission('machine.list');

        return Inertia::render('machine/FloorPlan', $this->locationService->getFloorPlanData($floor));
    }

    // 3. Swap two machines on the same floor
    public function swap(Request $request)
    {
        $this->requirePermission('machine.edit');

        $validated = $request->validate([
            'machine1_id' => ['required', 'integer', 'exists:machines,id'],
            'machine2_id' => ['required', 'integer', 'exists:machines,id'],
        ]);

        try {
            $this->locationService->swapMachines(
                Machine::findOrFail($validated['machine1_id']),
                Machine::findOrFail($validated['machine2_id'])
            );

            return redirect()->back()->with('success', 'Machines swapped successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        }
    }

    // 4. Move multiple machines to a new floor
    public function moveToFloor(Request $request)
    {
        $this->requirePermission('machine.edit');

        $validated = $request->validate([
            'machine_ids'     => ['required', 'array'],
            'machine_ids.*'   => ['integer', 'exists:machines,id'],
            'target_floor_id' => ['required', 'integer', 'exists:floors,id'],
        ]);

        try {
            $this->locationService->moveMachinesToFloor($validated['machine_ids'], $validated['target_floor_id']);
            return redirect()->back()->with('success', 'Machines moved to new floor successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        }
    }

    // 5. Unassign a single machine
    public function removeLocation(Machine $machine)
    {
        $this->requirePermission('machine.edit');

        $this->locationService->removeFromCurrentLocation($machine, 'Manually unassigned from location board.');

        return redirect()->back()->with('success', 'Machine unassigned successfully.');
    }

    // 6. Bulk unassign multiple machines
    public function bulkRemoveLocation(Request $request)
    {
        $this->requirePermission('machine.edit');

        $validated = $request->validate([
            'machine_ids'   => ['required', 'array', 'min:1'],
            'machine_ids.*' => ['integer', 'exists:machines,id'],
        ]);

        try {
            $count = $this->locationService->bulkRemoveFromLocation($validated['machine_ids']);

            return redirect()->back()->with('success', $count . ' machine(s) unassigned successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        }
    }

    // 7. Move a single machine to a specific slot (empty slot)
    public function moveToSlot(Request $request)
    {
        $this->requirePermission('machine.edit');

        $validated = $request->validate([
            'machine_id' => ['required', 'integer', 'exists:machines,id'],
            'floor_id'   => ['required', 'integer', 'exists:floors,id'],
            'sl_no'      => ['required', 'string'],
        ]);

        try {
            $this->locationService->moveMachineToSlot(
                Machine::findOrFail($validated['machine_id']),
                $validated['floor_id'],
                $validated['sl_no']
            );

            return redirect()->back()->with('success', 'Machine moved to new slot successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        }
    }

    private function requirePermission(string $permission): void
    {
        if (!auth()->user()?->can($permission)) {
            abort(403, 'Unauthorized access');
        }
    }
}