<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MachineModel\UpdateMachineModelRequest;
use App\Http\Requests\MachineModel\StoreMachineModelRequest;
use App\Models\MachineModel;
use App\Services\MachineModelService;
use App\Http\Responses\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use InvalidArgumentException;

class MachineModelController extends Controller
{
    public function __construct(
        protected MachineModelService $modelService
    ) {

    }

    public function index(Request $request)
    {
        if (!auth()->user()?->can('machine_model.list')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        $categories = $this->modelService->getPaginated()->withQueryString();

        return ApiResponse::success(
            data: $categories->items(),
            meta: $categories,
            message: 'Machine models retrieved successfully.'
        );
    }


    public function store(StoreMachineModelRequest $request)
    {

        $model = $this->modelService->createModel($request->validated());

        return ApiResponse::success(
            data: $model,
            message: 'Machine model created successfully.',
            status: 201
        );
    }


    public function show($id)
    {
        if (!auth()->user()?->can('machine_model.view')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        try {
            $model = MachineModel::findOrFail($id);

            return ApiResponse::success(
                data: $model,
                message: 'Machine model retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return ApiResponse::error(message: 'Machine model not found.', status: 404);
        }
    }


    public function update(UpdateMachineModelRequest $request, MachineModel $machineModel)
    {
        try {
            $updatedModel = $this->modelService->updateModel(
                $machineModel,
                $request->validated()
            );

            return ApiResponse::success(
                data: $updatedModel,
                message: 'Machine model updated successfully.'
            );
        } catch (InvalidArgumentException $e) {
            return ApiResponse::error(message: $e->getMessage(), status: 422);
        }
    }


    public function destroy($id)
    {
        if (!auth()->user()?->can('machine_model.delete')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        try {
            $model = MachineModel::findOrFail($id);

            $this->modelService->deleteModel($model);

            return ApiResponse::success(
                message: 'Machine model deleted successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return ApiResponse::error(message: 'Machine model not found.', status: 404);
        }
    }
}
