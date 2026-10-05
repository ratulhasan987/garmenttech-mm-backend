<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Brand\StoreBrandRequest;
use App\Http\Requests\Brand\UpdateBrandRequest;
use App\Http\Resources\Brand\BrandSuggestionResource;
use App\Http\Responses\ApiResponse;
use App\Models\Brand;
use App\Services\BrandService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use InvalidArgumentException;

class BrandController extends Controller
{
    public function __construct(
        protected BrandService $brandService
    ) {
    }

    public function index(Request $request)
    {
        if (!auth()->user()?->can('brand.list')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        $brands = $this->brandService->getPaginated()->withQueryString();

        return ApiResponse::success(
            data: $brands->items(),
            meta: $brands,
            message: 'Brands retrieved successfully.'
        );
    }

    public function store(StoreBrandRequest $request)
    {
        $brand = $this->brandService->createBrand($request->validated());

        return ApiResponse::success(
            data: $brand,
            message: 'Brand created successfully.',
            status: 201
        );
    }

    public function show($id)
    {
        if (!auth()->user()?->can('brand.view')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        try {
            $brand = Brand::findOrFail($id);

            return ApiResponse::success(
                data: $brand,
                message: 'Brand retrieved successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return ApiResponse::error(message: 'Brand not found.', status: 404);
        }
    }

    public function update(UpdateBrandRequest $request, Brand $brand)
    {
        try {
            $updatedBrand = $this->brandService->updateBrand(
                $brand,
                $request->validated()
            );

            return ApiResponse::success(
                data: $updatedBrand,
                message: 'Brand updated successfully.'
            );
        } catch (InvalidArgumentException $e) {
            return ApiResponse::error(message: $e->getMessage(), status: 422);
        }
    }

    public function destroy($id)
    {
        if (!auth()->user()?->can('brand.delete')) {
            return ApiResponse::error(message: 'Unauthorized access', status: 403);
        }

        try {
            $brand = Brand::findOrFail($id);

            $this->brandService->deleteBrand($brand);

            return ApiResponse::success(
                message: 'Brand deleted successfully.'
            );
        } catch (ModelNotFoundException $e) {
            return ApiResponse::error(message: 'Brand not found.', status: 404);
        }
    }

    public function suggestions(Request $request)
    {

        $brands = $this->brandService->searchBrands($request);

        return ApiResponse::success(
            data: BrandSuggestionResource::collection($brands),
            message: 'Brand suggestions retrieved successfully.'
        );
    }
}
