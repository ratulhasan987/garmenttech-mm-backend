<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Brand\StoreBrandRequest;
use App\Http\Requests\Brand\UpdateBrandRequest;
use App\Models\Brand;
use App\Services\BrandService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function __construct(
        protected BrandService $brandService
    ) {}

    public function index(Request $request): Response
    {
        if (!auth()->user()?->can('brand.list')) {
            abort(403, 'Unauthorized access');
        }

        $brands = $this->brandService->getPaginated();

        return Inertia::render('machine/settings/brand/Index', [
            'data' => $brands,
        ]);
    }

    public function store(StoreBrandRequest $request)
    {
        if (!auth()->user()?->can('brand.create')) {
            abort(403, 'Unauthorized access');
        }

        $this->brandService->createBrand($request->validated());

        return redirect()->back()->with('success', 'Brand created successfully.');
    }

    public function update(UpdateBrandRequest $request, Brand $brand)
    {
        if (!auth()->user()?->can('brand.edit')) {
            abort(403, 'Unauthorized access');
        }

        $this->brandService->updateBrand($brand, $request->validated());

        return redirect()->back()->with('success', 'Brand updated successfully.');
    }

    public function destroy($id)
    {
        if (!auth()->user()?->can('brand.delete')) {
            abort(403, 'Unauthorized access');
        }

        $brand = Brand::findOrFail($id);
        $this->brandService->deleteBrand($brand);

        return redirect()->back()->with('success', 'Brand deleted successfully.');
    }
}