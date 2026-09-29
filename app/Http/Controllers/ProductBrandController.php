<?php

namespace App\Http\Controllers;

use App\Models\ProductBrand;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProductBrandController
    extends Controller
{
    public function index()
    {
        return Inertia::render(
            'operations/inventory/brands/index',
            [
                'data' =>
                    ProductBrand::query()
                        ->latest()
                        ->paginate(30),
            ]
        );
    }

    public function store(
        Request $request
    ) {
        ProductBrand::create(
            $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    'unique:product_brands,name',
                ],
            ])
        );

        return redirect()
            ->back()
            ->with([
                'message' =>
                    'Product brand created successfully.',
                'type' =>
                    'success',
            ]);
    }

    public function update(
        Request $request,
        ProductBrand $productBrand
    ) {
        $productBrand->update(
            $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',

                    Rule::unique(
                        'product_brands',
                        'name'
                    )->ignore(
                        $productBrand->id
                    ),
                ],
            ])
        );

        return redirect()
            ->back()
            ->with([
                'message' =>
                    'Product brand updated successfully.',
                'type' =>
                    'success',
            ]);
    }

    public function destroy(
        ProductBrand $productBrand
    ) {
        if (
            $productBrand
                ->products()
                ->exists()
        ) {
            return redirect()
                ->back()
                ->with([
                    'message' =>
                        'Brand is currently used by products.',
                    'type' =>
                        'error',
                ]);
        }

        $productBrand->delete();

        return redirect()
            ->back()
            ->with([
                'message' =>
                    'Product brand deleted successfully.',
                'type' =>
                    'success',
            ]);
    }
}