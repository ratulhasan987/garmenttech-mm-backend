<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Building\StoreBuildingRequest;
use App\Http\Requests\Building\UpdateBuildingRequest;
use App\Models\Building;
use App\Http\Responses\ApiResponse;
use App\Services\BuildingService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Dedoc\Scramble\Attributes\Response;

class BuildingController extends Controller
{
    public function __construct(
        protected BuildingService $buildingService
    ) {

    }

    public function index(Request $request)
    {
        if (!auth()->user()?->can('building.list')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        $buildings = $this->buildingService->getPaginated()->withQueryString();

        return ApiResponse::success(
            data: $buildings->items(),
            meta: $buildings,
            message: 'Buildings are retrieved successfully.'
        );
    }


    public function store(StoreBuildingRequest $request)
    {

        $building = $this->buildingService->createBuilding($request->validated());

        return ApiResponse::success(
            data: $building,
            message: 'Building created successfully.',
            status: 201
        );
    }


    public function show($id)
    {
        if (!auth()->user()?->can('building.view')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        try {
            $building = Building::findOrFail($id);

            return ApiResponse::success(
                data: $building,
                message: 'Building retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return ApiResponse::error(message: 'Building not found.', status: 404);
        }
    }


    public function update(UpdateBuildingRequest $request, Building $building)
    {
        try {
            $updatedBuilding = $this->buildingService->updateBuilding(
                $building,
                $request->validated()
            );

            return ApiResponse::success(
                data: $updatedBuilding,
                message: 'Building updated successfully.'
            );
        } catch (InvalidArgumentException $e) {
            return ApiResponse::error(message: $e->getMessage(), status: 422);
        }
    }


    public function destroy($id)
    {
        if (!auth()->user()?->can('building.delete')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        try {
            $building = Building::findOrFail($id);

            $this->buildingService->deleteBuilding($building);

            return ApiResponse::success(
                message: 'Building deleted successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return ApiResponse::error(message: 'Building not found.', status: 404);
        }
    }
}
