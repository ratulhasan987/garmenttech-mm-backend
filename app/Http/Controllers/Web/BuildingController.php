<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Building\StoreBuildingRequest;
use App\Http\Requests\Building\UpdateBuildingRequest;
use App\Models\Building;
use App\Services\BuildingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BuildingController extends Controller
{
    public function __construct(
        protected BuildingService $buildingService
    ) {}

    public function index(Request $request): Response
    {
        if (!auth()->user()?->can('building.list')) {
            abort(403, 'Unauthorized access');
        }

        $buildings = $this->buildingService->getPaginated();

        return Inertia::render('machine/settings/building/Index', [
            'data' => $buildings,
        ]);
    }

    public function store(StoreBuildingRequest $request)
    {
        if (!auth()->user()?->can('building.create')) {
            abort(403, 'Unauthorized access');
        }

        $this->buildingService->createBuilding($request->validated());

        return redirect()->back()->with('success', 'Building created successfully.');
    }

    public function update(UpdateBuildingRequest $request, Building $building)
    {
        if (!auth()->user()?->can('building.edit')) {
            abort(403, 'Unauthorized access');
        }

        $this->buildingService->updateBuilding($building, $request->validated());

        return redirect()->back()->with('success', 'Building updated successfully.');
    }

    public function destroy($id)
    {
        if (!auth()->user()?->can('building.delete')) {
            abort(403, 'Unauthorized access');
        }

        $building = Building::findOrFail($id);
        $this->buildingService->deleteBuilding($building);

        return redirect()->back()->with('success', 'Building deleted successfully.');
    }
}