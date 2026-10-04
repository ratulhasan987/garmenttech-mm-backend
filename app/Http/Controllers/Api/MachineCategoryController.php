<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MachineCategory\UpdateMachineCategoryRequest;
use App\Http\Requests\MachineCategory\StoreMachineCategoryRequest;
use App\Http\Resources\MachineCategoryResource;
use App\Models\MachineCategory;
use App\Services\MachineCategoryService;
use App\Http\Responses\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use InvalidArgumentException;

class MachineCategoryController extends Controller
{
    public function __construct(
        protected MachineCategoryService $categoryService
    ) {

    }

    public function index(Request $request)
    {
        if (!auth()->user()?->can('user.list')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        $categories = $this->categoryService->getPaginated()->withQueryString();

        return ApiResponse::success(
            data: $categories->items(),
            meta: $categories,
            message: 'Machine categories retrieved successfully.'
        );
    }


    public function store(StoreMachineCategoryRequest $request)
    {

        $category = $this->categoryService->createCategory($request->validated());

        return ApiResponse::success(
            data: new MachineCategoryResource($category->load(['parent',])),
            message: 'Machine category created successfully.',
            status: 201
        );
    }

    /**
     * Display the specified category.
     */
    public function show($id)
    {
        if (!auth()->user()?->can('machine_category.list')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        try {
            $category = MachineCategory::with(['parent'])->findOrFail($id);

            return ApiResponse::success(
                data: new MachineCategoryResource($category),
                message: 'Machine category retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return ApiResponse::error(message: 'Machine category not found.', status: 404);
        }
    }


    public function update(UpdateMachineCategoryRequest $request, MachineCategory $machineCategory)
    {
        try {
            $updatedCategory = $this->categoryService->updateCategory(
                $machineCategory,
                $request->validated()
            );

            return ApiResponse::success(
                data: new MachineCategoryResource($updatedCategory->load(['parent', 'children'])),
                message: 'Machine category updated successfully.'
            );
        } catch (InvalidArgumentException $e) {
            return ApiResponse::error(message: $e->getMessage(), status: 422);
        }
    }


    public function destroy($id)
    {
        if (!auth()->user()?->can('machine_category.delete')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        try {
            $category = MachineCategory::findOrFail($id);

            // Reassign child categories to parent before deleting
            $this->categoryService->deleteCategory($category, reassignChildrenToParent: true);

            return ApiResponse::success(
                message: 'Machine category deleted successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return ApiResponse::error(message: 'Machine category not found.', status: 404);
        }
    }
}
