<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProductCategoryController extends Controller
{
    public function index()
    {
        $categories = ProductCategory::query()
            ->with([
                'parent:id,name',
            ])
            ->latest()
            ->paginate(30)
            ->withQueryString();

        $parents = ProductCategory::query()
            ->whereNull('parent_id')
            ->select([
                'id',
                'name',
            ])
            ->orderBy('name')
            ->get();

        return Inertia::render(
            'operations/inventory/categories/index',
            [
                'data' => $categories,
                'parents' => $parents,
            ]
        );
    }

    // Store
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'parent_id' => [
                'nullable',
                'integer',
                'exists:product_categories,id',
            ],
        ]);

        ProductCategory::create(
            $validated
        );

        return redirect()
            ->back()
            ->with('notification', [
                'message' => 'Product category created successfully.',
                'type' => 'success',
                'key' => (string) str()->uuid(),
            ]);
    }

    // Update
    public function update(
        Request $request,
        ProductCategory $productCategory
    ) {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'parent_id' => [
                'nullable',
                'integer',
                'exists:product_categories,id',

                Rule::notIn([
                    $productCategory->id,
                ]),
            ],
        ]);

        // Prevent Parent -> Child circular hierarchy
        if (
            $validated['parent_id'] ??
            null
        ) {
            $parent = ProductCategory::find(
                $validated['parent_id']
            );

            if (
                $parent &&
                $parent->parent_id ===
                $productCategory->id
            ) {
                return redirect()
                    ->back()
                    ->withErrors([
                        'parent_id' =>
                            'This category cannot use one of its own subcategories as its parent.',
                    ]);
            }
        }

        $productCategory->update(
            $validated
        );

        return redirect()
            ->back()
            ->with([
                'message' => 'Product category updated successfully.',
                'type' => 'success',
            ]);
    }


    public function destroy(
        ProductCategory $productCategory
    ) {
        if (
            $productCategory
                ->products()
                ->exists()
        ) {
            return redirect()
                ->back()
                ->with("notification", [
                    'message' =>
                        'Category cannot be deleted because products are using it.',
                    'type' =>
                        'error',
                    'key' => (string) str()->uuid(),
                ]);
        }

        /*
        | Because parent_id uses nullOnDelete(),
        | children would become root categories.
        |
        | I prefer preventing accidental hierarchy changes.
        */

        if (
            $productCategory
                ->children()
                ->exists()
        ) {
            return redirect()
                ->back()
                ->with("notification", [
                    'message' =>
                        'Category cannot be deleted while it has subcategories.',
                    'type' =>
                        'error',
                    'key' => (string) str()->uuid(),
                ]);
        }

        $productCategory->delete();

        return redirect()
            ->back()
            ->with("notification", [
                'message' =>
                    'Product category deleted successfully.',
                'type' =>
                    'success',
                'key' => (string) str()->uuid(),
            ]);
    }
}
