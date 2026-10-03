<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Floor\StoreFloorRequest;
use App\Http\Requests\Floor\UpdateFloorRequest;
use App\Models\Floor;
use App\Http\Responses\ApiResponse;
use App\Services\FloorService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use InvalidArgumentException;

class FloorController extends Controller
{
    public function __construct(
        protected FloorService $floorService
    ) {

    }

    public function index(Request $request)
    {
        if (!auth()->user()?->can('floor.list')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        $floors = $this->floorService->getPaginated()->withQueryString();

        return ApiResponse::success(
            data: $floors->items(),
            meta: $floors,
            message: 'Floors are retrieved successfully.'
        );
    }


    public function store(StoreFloorRequest $request)
    {

        $floor = $this->floorService->createFloor($request->validated());

        return ApiResponse::success(
            data: $floor,
            message: 'Floor created successfully.',
            status: 201
        );
    }


    public function show($id)
    {
        if (!auth()->user()?->can('floor.view')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        try {
            $floor = Floor::findOrFail($id);

            return ApiResponse::success(
                data: $floor,
                message: 'Floor retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return ApiResponse::error(message: 'Floor not found.', status: 404);
        }
    }


    public function update(UpdateFloorRequest $request, Floor $floor)
    {
        try {
            $updatedFloor = $this->floorService->updateFloor(
                $floor,
                $request->validated()
            );

            return ApiResponse::success(
                data: $updatedFloor,
                message: 'Floor updated successfully.'
            );
        } catch (InvalidArgumentException $e) {
            return ApiResponse::error(message: $e->getMessage(), status: 422);
        }
    }


    public function destroy($id)
    {
        if (!auth()->user()?->can('floor.delete')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        try {
            $floor = Floor::findOrFail($id);

            $this->floorService->deleteFloor($floor);

            return ApiResponse::success(
                message: 'Floor deleted successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return ApiResponse::error(message: 'Floor not found.', status: 404);
        }
    }
}
