<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductBrand;
use App\Models\ProductCategory;
use App\Models\Stock;
use App\Models\Tax;
use App\Models\Unit;
use App\Models\Warehouse;
use App\Services\ProductSearchService;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    // Product list
    public function index(
        Request $request
    ): Response {
        $keyword =
            trim(
                (string) $request->input(
                    'keyword',
                    ''
                )
            );

        $categoryId =
            $request->filled('category_id')
            ? (int) $request->input('category_id')
            : null;

        $subcategoryId =
            $request->filled('subcategory_id')
            ? (int) $request->input('subcategory_id')
            : null;

        $brandId =
            $request->filled('brand_id')
            ? (int) $request->input('brand_id')
            : null;

        $status =
            $request->filled('status')
            ? (string) $request->input('status')
            : null;

        $categoryIds =
            $this->getCategoryFilterIds(
                $categoryId,
                $subcategoryId
            );

        $products =
            Product::query()
                ->with([
                    'category:id,parent_id,name',
                    'category.parent:id,name',
                    'brand:id,name',
                    'unit:id,name',
                ])
                ->when(
                    $keyword !== '',
                    function ($query) use ($keyword) {
                        $query->where(
                            function ($query) use ($keyword) {
                                $query
                                    ->where(
                                        'name',
                                        'like',
                                        "%{$keyword}%"
                                    )
                                    ->orWhere(
                                        'code',
                                        'like',
                                        "%{$keyword}%"
                                    );
                            }
                        );
                    }
                )
                ->when(
                    count($categoryIds) > 0,
                    fn($query) =>
                        $query->whereIn(
                            'product_category_id',
                            $categoryIds
                        )
                )
                ->when(
                    $brandId,
                    fn($query) =>
                        $query->where(
                            'product_brand_id',
                            $brandId
                        )
                )
                ->when(
                    in_array(
                        $status,
                        ['0', '1'],
                        true
                    ),
                    fn($query) =>
                        $query->where(
                            'status',
                            (bool) ((int) $status)
                        )
                )
                ->latest('id')
                ->paginate(30)
                ->withQueryString();

        return Inertia::render(
            'operations/inventory/products/index',
            [
                'data' => $products,

                'filters' => [
                    'keyword' => $keyword,
                    'category_id' => $categoryId,
                    'subcategory_id' => $subcategoryId,
                    'brand_id' => $brandId,
                    'status' => $status,
                ],

                ...$this->formOptions(),
            ]
        );
    }

    // Product search
    public function search(
        Request $request
    ): JsonResponse {
        $validated =
            $request->validate([
                'keyword' => [
                    'nullable',
                    'string',
                    'max:150',
                ],

                'category_id' => [
                    'nullable',
                    'integer',
                    'exists:product_categories,id',
                ],

                'subcategory_id' => [
                    'nullable',
                    'integer',
                    'exists:product_categories,id',
                ],

                'brand_id' => [
                    'nullable',
                    'integer',
                    'exists:product_brands,id',
                ],

                'warehouse_id' => [
                    'nullable',
                    'integer',
                    'exists:warehouses,id',
                ],
            ]);

        $keyword =
            trim(
                (string) (
                    $validated['keyword'] ??
                    ''
                )
            );

        $categoryId =
            !empty($validated['category_id'])
            ? (int) $validated['category_id']
            : null;

        $subcategoryId =
            !empty($validated['subcategory_id'])
            ? (int) $validated['subcategory_id']
            : null;

        $brandId =
            !empty($validated['brand_id'])
            ? (int) $validated['brand_id']
            : null;

        $warehouseId =
            !empty($validated['warehouse_id'])
            ? (int) $validated['warehouse_id']
            : null;

        if (!$warehouseId) {
            $warehouseId =
                Warehouse::query()
                    ->where('is_default', true)
                    ->where('status', true)
                    ->value('id');
        }

        $categoryIds =
            $this->getCategoryFilterIds(
                $categoryId,
                $subcategoryId
            );

        $products =
            Product::query()
                ->with([
                    'unit:id,name',
                ])
                ->where('status', true)
                ->when(
                    count($categoryIds) > 0,
                    fn($query) =>
                        $query->whereIn(
                            'product_category_id',
                            $categoryIds
                        )
                )
                ->when(
                    $brandId,
                    fn($query) =>
                        $query->where(
                            'product_brand_id',
                            $brandId
                        )
                )
                ->when(
                    $keyword !== '',
                    function ($query) use ($keyword) {
                        $query->where(
                            function ($query) use ($keyword) {
                                $query
                                    ->where(
                                        'name',
                                        'like',
                                        "%{$keyword}%"
                                    )
                                    ->orWhere(
                                        'code',
                                        'like',
                                        "%{$keyword}%"
                                    );
                            }
                        );
                    }
                )
                ->orderBy('name')
                ->limit(20)
                ->get();

        $stockMap =
            collect();

        if ($warehouseId) {
            $stockMap =
                Stock::query()
                    ->where(
                        'warehouse_id',
                        $warehouseId
                    )
                    ->whereIn(
                        'item_id',
                        $products->pluck('id')
                    )
                    ->get()
                    ->keyBy('item_id');
        }

        $results =
            $products
                ->map(
                    function (Product $product) use ($stockMap) {
                        $stock =
                            $stockMap->get(
                                $product->id
                            );

                        $availableStock =
                            $stock
                            ? max(
                                0,
                                (float) $stock->quantity -
                                (float) $stock->reserved_quantity
                            )
                            : 0;

                        return [
                            'id' =>
                                $product->id,

                            'code' =>
                                $product->code,

                            'name' =>
                                $product->name,

                            'unit_id' =>
                                $product->unit_id,

                            'unit' =>
                                $product->unit?->name,

                            'purchase_price' =>
                                (float) $product->purchase_price,

                            'sales_price' =>
                                (float) $product->sales_price,

                            'available_stock' =>
                                $availableStock,

                            'purchase_tax_ids' =>
                                array_map(
                                    'intval',
                                    $product->purchase_tax_ids ??
                                    []
                                ),

                            'sales_tax_ids' =>
                                array_map(
                                    'intval',
                                    $product->sales_tax_ids ??
                                    []
                                ),
                        ];
                    }
                )
                ->values();

        return response()->json(
            $results
        );
    }

    // Create page
    public function create(): Response
    {
        return Inertia::render(
            'operations/inventory/products/create',
            $this->formOptions()
        );
    }

    // Store product
    public function store(
        Request $request
    ) {
        $validated =
            $this->validateProduct(
                $request
            );

        $productCategoryId =
            $this->resolveProductCategoryId(
                $validated
            );

        DB::transaction(
            function () use ($validated, $productCategoryId) {
                Product::create([
                    'code' =>
                        $this->generateProductCode(),

                    'name' =>
                        $validated['name'],

                    'product_category_id' =>
                        $productCategoryId,

                    'product_brand_id' =>
                        $validated['product_brand_id'] ??
                        null,

                    'unit_id' =>
                        $validated['unit_id'],

                    'reorder_level' =>
                        $validated['reorder_level'],

                    'purchase_price' =>
                        $validated['purchase_price'],

                    'sales_price' =>
                        $validated['sales_price'],

                    'purchase_tax_ids' =>
                        $this->cleanTaxIds(
                            $validated['purchase_tax_ids'] ??
                            []
                        ),

                    'sales_tax_ids' =>
                        $this->cleanTaxIds(
                            $validated['sales_tax_ids'] ??
                            []
                        ),

                    'status' =>
                        $validated['status'],

                    'description' =>
                        $validated['description'] ??
                        null,
                ]);
            }
        );

        return redirect()
            ->route(
                'operations.products.index'
            )
            ->with(
                'notification',
                [
                    'message' =>
                        'Product created successfully.',

                    'type' =>
                        'success',
                ]
            );
    }

    // Edit page
    public function edit(
        Product $product
    ): Response {
        $category =
            ProductCategory::query()
                ->select([
                    'id',
                    'parent_id',
                    'name',
                ])
                ->findOrFail(
                    $product->product_category_id
                );

        return Inertia::render(
            'operations/inventory/products/edit',
            [
                ...$this->formOptions(),

                'product' => [
                    'id' =>
                        $product->id,

                    'name' =>
                        $product->name,

                    'category_id' =>
                        $category->parent_id
                        ? (int) $category->parent_id
                        : (int) $category->id,

                    'subcategory_id' =>
                        $category->parent_id
                        ? (int) $category->id
                        : null,

                    'product_brand_id' =>
                        $product->product_brand_id,

                    'unit_id' =>
                        $product->unit_id,

                    'reorder_level' =>
                        $product->reorder_level,

                    'purchase_price' =>
                        $product->purchase_price,

                    'sales_price' =>
                        $product->sales_price,

                    'purchase_tax_ids' =>
                        array_map(
                            'intval',
                            $product->purchase_tax_ids ??
                            []
                        ),

                    'sales_tax_ids' =>
                        array_map(
                            'intval',
                            $product->sales_tax_ids ??
                            []
                        ),

                    'status' =>
                        (bool) $product->status,

                    'description' =>
                        $product->description,
                ],
            ]
        );
    }

    // Update product
    public function update(
        Request $request,
        Product $product
    ) {
        $validated =
            $this->validateProduct(
                $request
            );

        $productCategoryId =
            $this->resolveProductCategoryId(
                $validated
            );

        $product->update([
            'name' =>
                $validated['name'],

            'product_category_id' =>
                $productCategoryId,

            'product_brand_id' =>
                $validated['product_brand_id'] ??
                null,

            'unit_id' =>
                $validated['unit_id'],

            'reorder_level' =>
                $validated['reorder_level'],

            'purchase_price' =>
                $validated['purchase_price'],

            'sales_price' =>
                $validated['sales_price'],

            'purchase_tax_ids' =>
                $this->cleanTaxIds(
                    $validated['purchase_tax_ids'] ??
                    []
                ),

            'sales_tax_ids' =>
                $this->cleanTaxIds(
                    $validated['sales_tax_ids'] ??
                    []
                ),

            'status' =>
                $validated['status'],

            'description' =>
                $validated['description'] ??
                null,
        ]);

        return redirect()
            ->route(
                'operations.products.index'
            )
            ->with(
                'notification',
                [
                    'message' =>
                        'Product updated successfully.',

                    'type' =>
                        'success',
                ]
            );
    }

    // Delete product
    public function destroy(
        Product $product
    ) {
        if (
            $product
                ->stocks()
                ->where(
                    'quantity',
                    '!=',
                    0
                )
                ->exists()
        ) {
            return back()
                ->with(
                    'notification',
                    [
                        'message' =>
                            'Product cannot be deleted because stock exists.',

                        'type' =>
                            'error',
                    ]
                );
        }

        try {
            $product->delete();
        } catch (
            QueryException $exception
        ) {
            return back()
                ->with(
                    'notification',
                    [
                        'message' =>
                            'Product cannot be deleted because it is being used.',

                        'type' =>
                            'error',
                    ]
                );
        }

        return back()
            ->with(
                'notification',
                [
                    'message' =>
                        'Product deleted successfully.',

                    'type' =>
                        'success',
                ]
            );
    }

    // Validation
    private function validateProduct(
        Request $request
    ): array {
        $validated =
            $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'category_id' => [
                    'required',
                    'integer',
                    'exists:product_categories,id',
                ],

                'subcategory_id' => [
                    'nullable',
                    'integer',
                    'exists:product_categories,id',
                ],

                'product_brand_id' => [
                    'nullable',
                    'integer',
                    'exists:product_brands,id',
                ],

                'unit_id' => [
                    'required',
                    'integer',
                    'exists:units,id',
                ],

                'reorder_level' => [
                    'required',
                    'numeric',
                    'min:0',
                ],

                'purchase_price' => [
                    'required',
                    'numeric',
                    'min:0',
                ],

                'sales_price' => [
                    'required',
                    'numeric',
                    'min:0',
                ],

                'purchase_tax_ids' => [
                    'nullable',
                    'array',
                ],

                'purchase_tax_ids.*' => [
                    'integer',
                    'distinct',
                    'exists:taxes,id',
                ],

                'sales_tax_ids' => [
                    'nullable',
                    'array',
                ],

                'sales_tax_ids.*' => [
                    'integer',
                    'distinct',
                    'exists:taxes,id',
                ],

                'status' => [
                    'required',
                    'boolean',
                ],

                'description' => [
                    'nullable',
                    'string',
                    'max:2000',
                ],
            ]);

        $validRoot =
            ProductCategory::query()
                ->whereKey(
                    $validated['category_id']
                )
                ->whereNull('parent_id')
                ->exists();

        if (!$validRoot) {
            throw ValidationException::withMessages([
                'category_id' =>
                    'Please select a valid category.',
            ]);
        }

        if (
            !empty(
            $validated['subcategory_id']
        )
        ) {
            $validSubcategory =
                ProductCategory::query()
                    ->whereKey(
                        $validated['subcategory_id']
                    )
                    ->where(
                        'parent_id',
                        $validated['category_id']
                    )
                    ->exists();

            if (!$validSubcategory) {
                throw ValidationException::withMessages([
                    'subcategory_id' =>
                        'Selected sub category does not belong to the category.',
                ]);
            }
        }

        return $validated;
    }

    // Resolve stored category
    private function resolveProductCategoryId(
        array $validated
    ): int {
        return !empty(
            $validated['subcategory_id']
        )
            ? (int) $validated['subcategory_id']
            : (int) $validated['category_id'];
    }

    // Form options
    private function formOptions(): array
    {
        return [
            'categories' =>
                ProductCategory::query()
                    ->whereNull('parent_id')
                    ->select([
                        'id',
                        'name',
                    ])
                    ->orderBy('name')
                    ->get(),

            'subcategories' =>
                ProductCategory::query()
                    ->whereNotNull('parent_id')
                    ->select([
                        'id',
                        'parent_id',
                        'name',
                    ])
                    ->orderBy('name')
                    ->get(),

            'brands' =>
                ProductBrand::query()
                    ->select([
                        'id',
                        'name',
                    ])
                    ->orderBy('name')
                    ->get(),

            'units' =>
                Unit::query()
                    ->select([
                        'id',
                        'name',
                    ])
                    ->orderBy('name')
                    ->get(),

            'taxes' =>
                Tax::query()
                    ->select([
                        'id',
                        'name',
                        'rate',
                    ])
                    ->orderBy('name')
                    ->get(),
        ];
    }

    // Category filter
    private function getCategoryFilterIds(
        ?int $categoryId,
        ?int $subcategoryId
    ): array {
        if ($subcategoryId) {
            return [
                $subcategoryId,
            ];
        }

        if (!$categoryId) {
            return [];
        }

        $children =
            ProductCategory::query()
                ->where(
                    'parent_id',
                    $categoryId
                )
                ->pluck('id')
                ->map(
                    fn($id) =>
                        (int) $id
                )
                ->all();

        return [
            $categoryId,
            ...$children,
        ];
    }

    // Tax IDs
    private function cleanTaxIds(
        array $taxIds
    ): array {
        return collect(
            $taxIds
        )
            ->map(
                fn($id) =>
                    (int) $id
            )
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    // Product code
    private function generateProductCode(): string
    {
        $lastProduct =
            Product::query()
                ->where(
                    'code',
                    'like',
                    'PRD-%'
                )
                ->orderByDesc('id')
                ->lockForUpdate()
                ->first();

        $next =
            1;

        if (
            $lastProduct &&
            preg_match(
                '/^PRD-(\d+)$/',
                $lastProduct->code,
                $matches
            )
        ) {
            $next =
                (int) $matches[1] +
                1;
        }

        do {
            $code =
                'PRD-' .
                str_pad(
                    (string) $next,
                    6,
                    '0',
                    STR_PAD_LEFT
                );

            $next++;
        } while (
            Product::query()
                ->where(
                    'code',
                    $code
                )
                ->exists()
        );

        return $code;
    }

    public function getProducts(Request $request, ProductSearchService $productSearchService)
    {
        return response()->json(
            $productSearchService->search($request),
        );
    }


}
