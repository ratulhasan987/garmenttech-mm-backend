<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Floor\StoreFloorRequest;
use App\Http\Requests\Floor\UpdateFloorRequest;
use App\Models\Building;
use App\Models\Floor;
use App\Services\FloorService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FloorController extends Controller
{
    public function __construct(
        protected FloorService $floorService
    ) {}

    public function index(Request $request): Response
    {
        if (!auth()->user()?->can('floor.list')) {
            abort(403, 'Unauthorized access');
        }

        $floors = $this->floorService->getPaginated();
        
        // Fetch buildings for the dropdown selector
        $buildings = Building::query()
            ->select('id', 'name', 'code')
            ->orderBy('name')
            ->get();

        return Inertia::render('machine/settings/floor/Index', [
            'data' => $floors,
            'buildings' => $buildings,
        ]);
    }

    public function store(StoreFloorRequest $request)
    {
        if (!auth()->user()?->can('floor.create')) {
            abort(403, 'Unauthorized access');
        }

        $this->floorService->createFloor($request->validated());

        return redirect()->back()->with('success', 'Floor created successfully.');
    }

    public function update(UpdateFloorRequest $request, Floor $floor)
    {
        if (!auth()->user()?->can('floor.edit')) {
            abort(403, 'Unauthorized access');
        }

        $this->floorService->updateFloor($floor, $request->validated());

        return redirect()->back()->with('success', 'Floor updated successfully.');
    }

    public function destroy($id)
    {
        if (!auth()->user()?->can('floor.delete')) {
            abort(403, 'Unauthorized access');
        }

        $floor = Floor::findOrFail($id);
        $this->floorService->deleteFloor($floor);

        return redirect()->back()->with('success', 'Floor deleted successfully.');
    }
}